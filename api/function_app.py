import json
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

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

ALLOWED_ORIGINS = {
    "http://localhost:8080",
    "https://www.blackstatic.cloud",
}
TABLE_NAME = "Counters"
PARTITION_KEY = "resume"
ROW_KEY = "visitors"
COUNT_FIELD = "count"


def _cors_headers(req: func.HttpRequest) -> dict:
    headers = {
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin",
    }
    origin = req.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
    return headers


def _json_response(req: func.HttpRequest, payload: dict, status_code: int = 200) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(payload),
        mimetype="application/json",
        status_code=status_code,
        headers=_cors_headers(req),
    )


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
    except Exception as exc:
        return _json_response(req, {"error": str(exc)}, status_code=500)


@app.route(route="counter/increment", methods=["POST", "OPTIONS"])
def counter_increment(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=_cors_headers(req))

    try:
        client = _table_client()
        count = _increment_counter_with_retry(client)
        return _json_response(req, {"count": count})
    except Exception as exc:
        return _json_response(req, {"error": str(exc)}, status_code=500)
