from __future__ import annotations

import os


DEFAULT_ALLOWED_ORIGINS = {
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://www.blackstatic.cloud",
}


def normalize_origin(origin: str | None) -> str | None:
    if origin is None:
        return None
    normalized = origin.strip().rstrip("/")
    return normalized or None


def allowed_origins() -> set[str]:
    configured = os.getenv("ALLOWED_ORIGINS", "")
    if not configured.strip():
        return {normalize_origin(origin) for origin in DEFAULT_ALLOWED_ORIGINS if normalize_origin(origin)}
    return {
        normalize_origin(origin)
        for origin in configured.split(",")
        if normalize_origin(origin)
    }


def is_allowed_origin(origin: str | None, *, allow_missing: bool = False) -> bool:
    normalized = normalize_origin(origin)
    if not normalized:
        return allow_missing
    return normalized in allowed_origins()
