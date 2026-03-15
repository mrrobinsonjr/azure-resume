from __future__ import annotations

import os
import time


_chat_requests: dict[str, list[float]] = {}


def chat_rate_limit_window_seconds() -> int:
    return int(os.getenv("CHAT_RATE_LIMIT_WINDOW_SECONDS", "600"))


def chat_rate_limit_max_requests() -> int:
    return int(os.getenv("CHAT_RATE_LIMIT_MAX_REQUESTS", "20"))


def is_rate_limited(client_ip: str) -> bool:
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
