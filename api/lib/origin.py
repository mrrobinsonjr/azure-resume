from __future__ import annotations

import os


DEFAULT_ALLOWED_ORIGINS = {
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://www.blackstatic.cloud",
}


def allowed_origins() -> set[str]:
    configured = os.getenv("ALLOWED_ORIGINS", "")
    if not configured.strip():
        return set(DEFAULT_ALLOWED_ORIGINS)
    return {
        origin.strip()
        for origin in configured.split(",")
        if origin.strip()
    }


def is_allowed_origin(origin: str | None, *, allow_missing: bool = False) -> bool:
    if not origin:
        return allow_missing
    return origin in allowed_origins()

