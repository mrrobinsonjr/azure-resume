from __future__ import annotations

import logging
import os
import random
import re
import time


_chat_requests: dict[str, list[float]] = {}

# Durable (cross-instance) rate limiting backed by Azure Table Storage.
_RL_TABLE = "ChatRateLimit"
_RL_PARTITION = "chat"
# Table Storage keys may not contain / \ # ? or control characters.
_KEY_DISALLOWED = re.compile(r"[/\\#?\x00-\x1f\x7f-\x9f]")


def chat_rate_limit_window_seconds() -> int:
    return int(os.getenv("CHAT_RATE_LIMIT_WINDOW_SECONDS", "600"))


def chat_rate_limit_max_requests() -> int:
    return int(os.getenv("CHAT_RATE_LIMIT_MAX_REQUESTS", "20"))


def is_rate_limited(client_ip: str) -> bool:
    """In-memory per-instance limiter: fast burst protection on a warm worker."""
    now = time.time()
    window = chat_rate_limit_window_seconds()
    max_requests = chat_rate_limit_max_requests()
    threshold = now - window

    recent = [stamp for stamp in _chat_requests.get(client_ip, []) if stamp >= threshold]
    if len(recent) >= max_requests:
        _chat_requests[client_ip] = recent
        return True

    recent.append(now)
    _chat_requests[client_ip] = recent

    # Opportunistic cleanup for quiet keys.
    stale_keys = [
        key
        for key, timestamps in _chat_requests.items()
        if timestamps and timestamps[-1] < threshold
    ]
    for key in stale_keys:
        _chat_requests.pop(key, None)

    return False


def _sanitize_key(value: str) -> str:
    cleaned = _KEY_DISALLOWED.sub("_", value or "")
    return cleaned[:512] or "unknown"


def _rl_table_client():
    connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not connection_string:
        return None
    # Imported lazily so the module loads even if azure-data-tables is absent.
    from azure.data.tables import TableServiceClient

    service = TableServiceClient.from_connection_string(connection_string)
    service.create_table_if_not_exists(_RL_TABLE)
    return service.get_table_client(_RL_TABLE)


def _entity_etag(entity) -> str | None:
    metadata = getattr(entity, "metadata", None) or entity.get("metadata") or {}
    return (
        getattr(entity, "etag", None)
        or entity.get("etag")
        or entity.get("odata.etag")
        or entity.get("@odata.etag")
        or metadata.get("etag")
        or metadata.get("odata.etag")
        or metadata.get("@odata.etag")
    )


def durable_is_rate_limited(client_ip: str) -> bool:
    """Fixed-window per-IP limiter backed by Table Storage.

    Shared across Function instances and durable across cold starts, so it
    holds even when the in-memory limiter resets. Fails OPEN (returns False)
    on any storage error to preserve chat availability.
    """
    from azure.core import MatchConditions
    from azure.core.exceptions import (
        ResourceExistsError,
        ResourceModifiedError,
        ResourceNotFoundError,
    )
    from azure.data.tables import UpdateMode

    window = chat_rate_limit_window_seconds()
    max_requests = chat_rate_limit_max_requests()
    row_key = _sanitize_key(client_ip)
    now = time.time()

    try:
        table = _rl_table_client()
        if table is None:
            return False

        for attempt in range(5):
            try:
                entity = table.get_entity(_RL_PARTITION, row_key)
            except ResourceNotFoundError:
                entity = None

            if entity is None:
                try:
                    table.create_entity(
                        {
                            "PartitionKey": _RL_PARTITION,
                            "RowKey": row_key,
                            "WindowStart": now,
                            "Count": 1,
                        }
                    )
                    return False
                except ResourceExistsError:
                    continue  # another worker created it; re-read

            window_start = float(entity.get("WindowStart", 0) or 0)
            count = int(entity.get("Count", 0) or 0)
            etag = _entity_etag(entity)
            if not etag:
                return False  # can't do a safe update; fail open

            # Window expired: start a fresh window.
            if now - window_start >= window:
                new_entity = {
                    "PartitionKey": _RL_PARTITION,
                    "RowKey": row_key,
                    "WindowStart": now,
                    "Count": 1,
                }
                try:
                    table.update_entity(
                        mode=UpdateMode.MERGE,
                        entity=new_entity,
                        etag=etag,
                        match_condition=MatchConditions.IfNotModified,
                    )
                    return False
                except ResourceModifiedError:
                    time.sleep((0.01 * (attempt + 1)) + random.uniform(0, 0.01))
                    continue

            # Within the window and over budget.
            if count >= max_requests:
                return True

            # Within the window and under budget: increment.
            new_entity = {
                "PartitionKey": _RL_PARTITION,
                "RowKey": row_key,
                "WindowStart": window_start,
                "Count": count + 1,
            }
            try:
                table.update_entity(
                    mode=UpdateMode.MERGE,
                    entity=new_entity,
                    etag=etag,
                    match_condition=MatchConditions.IfNotModified,
                )
                return False
            except ResourceModifiedError:
                time.sleep((0.01 * (attempt + 1)) + random.uniform(0, 0.01))
                continue

        # Exhausted retries under contention: fail open.
        return False
    except Exception:
        logging.exception("durable rate limit check failed; failing open")
        return False
