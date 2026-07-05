import json
import logging
import os
import random
import time

import azure.functions as func
from azure.core import MatchConditions
from azure.core.exceptions import (
    ResourceExistsError,
    ResourceModifiedError,
    ResourceNotFoundError,
)
from azure.data.tables import TableServiceClient, UpdateMode

from lib.openai_client import chat_completion, chat_configured
from lib.origin import allowed_origins, is_allowed_origin, normalize_origin
from lib.prompt import build_chat_messages, build_fallback_answer, build_mock_answer
from lib.rate_limit import durable_is_rate_limited, is_rate_limited
from lib.retrieval import preview_context, retrieve_context

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

TABLE_NAME = "Counters"
PARTITION_KEY = "resume"
ROW_KEY = "visitors"
COUNT_FIELD = "count"
RATE_LIMIT_SECONDS = 15
_ip_last_increment = {}

# Input caps for the chat endpoint (abuse / cost protection).
MAX_QUESTION_CHARS = 2000
MAX_BODY_BYTES = 16 * 1024


def _debug_enabled() -> bool:
    return os.getenv("CHAT_DEBUG", "").strip().lower() in ("1", "true", "yes", "on")


def _cors_headers(req: func.HttpRequest) -> dict:
    headers = {
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin",
    }
    origin = req.headers.get("Origin") or req.headers.get("origin")
    normalized_origin = normalize_origin(origin)
    if is_allowed_origin(normalized_origin):
        headers["Access-Control-Allow-Origin"] = normalized_origin
    return headers


def _json_response(req: func.HttpRequest, payload: dict, status_code: int = 200) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(payload),
        mimetype="application/json",
        status_code=status_code,
        headers=_cors_headers(req),
    )


def _chat_error(req: func.HttpRequest, message: str, status_code: int) -> func.HttpResponse:
    payload = {
        "error": message,
        "answer": "",
        "citations": [],
        "grounded": False,
        "mode": "error",
    }

    if status_code == 403 and _debug_enabled():
        payload.update(
            {
                "debug_origin_received": normalize_origin(req.headers.get("Origin") or req.headers.get("origin")),
                "debug_allowed_origins_raw": os.getenv("ALLOWED_ORIGINS", ""),
                "debug_allowed_origins_parsed": sorted(allowed_origins()),
            }
        )

    return _json_response(req, payload, status_code=status_code)


def _with_debug(payload: dict, debug: dict | None) -> dict:
    if not debug or not _debug_enabled():
        return payload
    enriched = dict(payload)
    enriched.update(debug)
    return enriched


def _dedupe_citations(items: list[dict]) -> list[dict]:
    seen = set()
    deduped = []
    for item in items:
        key = (item.get("title", ""), item.get("section", ""))
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped


def _parse_json_body(req: func.HttpRequest) -> dict:
    try:
        return req.get_json()
    except ValueError:
        return {}


def _client_ip(req: func.HttpRequest) -> str:
    forwarded_for = req.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return req.headers.get("X-Client-IP") or req.headers.get("REMOTE_ADDR") or "unknown"


def _table_client():
    connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not connection_string:
        raise RuntimeError("AZURE_STORAGE_CONNECTION_STRING is not set")

    service = TableServiceClient.from_connection_string(connection_string)
    service.create_table_if_not_exists(TABLE_NAME)
    return service.get_table_client(TABLE_NAME)


def _get_or_create_counter_entity(client):
    try:
        return client.get_entity(partition_key=PARTITION_KEY, row_key=ROW_KEY)
    except ResourceNotFoundError:
        try:
            client.create_entity(
                {
                    "PartitionKey": PARTITION_KEY,
                    "RowKey": ROW_KEY,
                    COUNT_FIELD: 0,
                }
            )
        except ResourceExistsError:
            pass
        return client.get_entity(partition_key=PARTITION_KEY, row_key=ROW_KEY)


def _increment_counter_with_retry(client, max_retries: int = 5) -> int:
    for attempt in range(max_retries):
        entity = _get_or_create_counter_entity(client)
        current_count = int(entity.get(COUNT_FIELD, 0))
        next_count = current_count + 1
        # Azure Tables may surface ETag through attribute or different keys.
        metadata = getattr(entity, "metadata", None) or entity.get("metadata") or {}
        etag = (
            getattr(entity, "etag", None)
            or entity.get("etag")
            or entity.get("odata.etag")
            or entity.get("@odata.etag")
            or metadata.get("etag")
            or metadata.get("odata.etag")
            or metadata.get("@odata.etag")
        )
        if not etag:
            raise RuntimeError("Counter entity is missing etag")

        try:
            try:
                client.update_entity(
                    mode=UpdateMode.MERGE,
                    entity={
                        "PartitionKey": PARTITION_KEY,
                        "RowKey": ROW_KEY,
                        COUNT_FIELD: next_count,
                    },
                    etag=etag,
                    match_condition=MatchConditions.IfNotModified,
                )
            except TypeError:
                client.update_entity(
                    mode=UpdateMode.MERGE,
                    entity={
                        "PartitionKey": PARTITION_KEY,
                        "RowKey": ROW_KEY,
                        COUNT_FIELD: next_count,
                    },
                    etag=etag,
                )
            return next_count
        except ResourceModifiedError:
            time.sleep((0.01 * (attempt + 1)) + random.uniform(0, 0.01))

    raise RuntimeError("Counter increment failed after retry limit")


@app.route(route="counter", methods=["GET", "OPTIONS"])
def counter_get(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=_cors_headers(req))

    try:
        client = _table_client()
        entity = _get_or_create_counter_entity(client)
        count = int(entity.get(COUNT_FIELD, 0))
        return _json_response(req, {"count": count})
    except Exception:
        logging.exception("counter request failed")
        return _json_response(req, {"error": "Counter is temporarily unavailable"}, status_code=500)


@app.route(route="counter/increment", methods=["POST", "OPTIONS"])
def counter_increment(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=_cors_headers(req))

    origin = req.headers.get("Origin") or req.headers.get("origin")
    if not is_allowed_origin(origin):
        return _json_response(req, {"error": "Forbidden"}, status_code=403)

    # Soft protection to reduce bot inflation; this is not strict security.
    client_ip = _client_ip(req)
    now = time.time()
    last_increment = _ip_last_increment.get(client_ip)
    if last_increment and (now - last_increment) < RATE_LIMIT_SECONDS:
        return _json_response(req, {"error": "Too many requests"}, status_code=429)
    _ip_last_increment[client_ip] = now

    try:
        client = _table_client()
        count = _increment_counter_with_retry(client)
        return _json_response(req, {"count": count})
    except Exception:
        logging.exception("counter request failed")
        return _json_response(req, {"error": "Counter is temporarily unavailable"}, status_code=500)


@app.route(route="chat", methods=["POST", "OPTIONS"])
def chat(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=_cors_headers(req))

    origin = req.headers.get("Origin") or req.headers.get("origin")
    if not is_allowed_origin(origin, allow_missing=True):
        return _chat_error(req, "Forbidden", 403)

    raw_body = req.get_body() or b""
    if len(raw_body) > MAX_BODY_BYTES:
        return _chat_error(req, "Request body too large", 413)

    client_ip = _client_ip(req)
    # In-memory (fast, per-instance) then durable (cross-instance) rate limits.
    if is_rate_limited(client_ip) or durable_is_rate_limited(client_ip):
        return _chat_error(req, "Too many chat requests", 429)

    body = _parse_json_body(req)
    question = (body.get("question") or "").strip()
    if not question:
        return _chat_error(req, "Question is required", 400)
    if len(question) > MAX_QUESTION_CHARS:
        return _chat_error(req, "Question is too long", 400)

    if not chat_configured():
        contexts = preview_context(question)
        citations = _dedupe_citations([
            {"id": item["id"], "title": item["title"], "section": item["section"]}
            for item in contexts
        ])
        return _json_response(
            req,
            {
                "answer": build_mock_answer(question, contexts),
                "citations": citations,
                "grounded": bool(contexts),
                "mode": "mock",
            },
        )

    try:
        retrieval = retrieve_context(question)
        contexts = retrieval["chunks"]
        citations = _dedupe_citations([
            {"id": item["id"], "title": item["title"], "section": item["section"]}
            for item in contexts
        ])

        if retrieval["mode"] != "ready":
            return _json_response(
                req,
                _with_debug(
                    {
                        "answer": build_fallback_answer(retrieval["reason"], contexts),
                        "citations": citations,
                        "grounded": retrieval["grounded"],
                        "mode": "fallback",
                    },
                    retrieval.get("debug"),
                ),
            )

        answer = chat_completion(build_chat_messages(question, contexts))
        return _json_response(
            req,
            {
                "answer": answer,
                "citations": citations,
                "grounded": retrieval["grounded"],
                "mode": "azure_openai_rag",
            },
        )
    except Exception:
        logging.exception("chat request failed")
        return _chat_error(req, "Chat is temporarily unavailable", 500)
