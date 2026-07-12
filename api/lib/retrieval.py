from __future__ import annotations

import json
import math
from pathlib import Path

from lib.openai_client import embedding_for_text, embeddings_configured


API_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = API_ROOT / "data"
CHUNKS_PATH = DATA_DIR / "rag_chunks.json"
EMBEDDINGS_PATH = DATA_DIR / "rag_embeddings.json"
TOP_K = 5
MIN_SCORE = 0.2


def _load_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def artifact_debug() -> dict:
    return {
        "debug_rag_chunks_path": str(CHUNKS_PATH),
        "debug_rag_chunks_exists": CHUNKS_PATH.exists(),
        "debug_rag_embeddings_path": str(EMBEDDINGS_PATH),
        "debug_rag_embeddings_exists": EMBEDDINGS_PATH.exists(),
    }


def _load_chunks() -> list[dict]:
    payload = _load_json(CHUNKS_PATH) or {}
    return payload.get("chunks", [])


def _load_embeddings() -> dict[str, list[float]]:
    payload = _load_json(EMBEDDINGS_PATH) or {}
    embeddings = {}
    for item in payload.get("embeddings", []):
        embeddings[item["id"]] = item["vector"]
    return embeddings


def _tokenize(text: str) -> set[str]:
    cleaned = text.lower().replace("/", " ").replace("-", " ").replace(",", " ")
    return {token for token in cleaned.split() if token}


def _keyword_preview(question: str, chunks: list[dict], limit: int = 3) -> list[dict]:
    query_tokens = _tokenize(question)
    scored = []
    for chunk in chunks:
        score = len(query_tokens.intersection(_tokenize(chunk.get("text", ""))))
        scored.append({**chunk, "score": float(score)})
    scored.sort(key=lambda item: item["score"], reverse=True)
    matched = [item for item in scored if item["score"] > 0]
    return matched[:limit] if matched else []


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    numerator = sum(a * b for a, b in zip(left, right))
    left_norm = math.sqrt(sum(a * a for a in left))
    right_norm = math.sqrt(sum(b * b for b in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return numerator / (left_norm * right_norm)


def _dedupe_chunks(chunks: list[dict]) -> list[dict]:
    seen = set()
    deduped = []
    for chunk in chunks:
        key = (chunk["title"], chunk["section"], chunk["text"][:120])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(chunk)
    return deduped


def preview_context(question: str) -> list[dict]:
    return _keyword_preview(question, _load_chunks(), limit=3)


def retrieve_context(question: str) -> dict:
    chunks = _load_chunks()
    if not chunks:
        return {
            "mode": "fallback",
            "grounded": False,
            "reason": f"RAG chunk artifact is missing at {CHUNKS_PATH}",
            "chunks": [],
            "debug": artifact_debug(),
        }

    embeddings = _load_embeddings()
    if not embeddings:
        return {
            "mode": "fallback",
            "grounded": False,
            "reason": "RAG embeddings artifact is missing",
            "chunks": _keyword_preview(question, chunks, limit=3),
            "debug": artifact_debug(),
        }

    if not embeddings_configured():
        return {
            "mode": "fallback",
            "grounded": False,
            "reason": "Azure OpenAI embedding env vars are not configured",
            "chunks": _keyword_preview(question, chunks, limit=3),
            "debug": artifact_debug(),
        }

    query_embedding = embedding_for_text(question)
    scored_chunks = []
    for chunk in chunks:
        vector = embeddings.get(chunk["id"])
        if not vector:
            continue
        score = _cosine_similarity(query_embedding, vector)
        if score >= MIN_SCORE:
            scored_chunks.append({**chunk, "score": score})

    scored_chunks.sort(key=lambda item: item["score"], reverse=True)
    top_chunks = _dedupe_chunks(scored_chunks)[:TOP_K]
    if not top_chunks:
        return {
            "mode": "fallback",
            "grounded": False,
            "reason": "No sufficiently relevant grounded chunks were found",
            "chunks": _keyword_preview(question, chunks, limit=3),
            "debug": artifact_debug(),
        }

    return {
        "mode": "ready",
        "grounded": True,
        "reason": "",
        "chunks": top_chunks,
        "debug": artifact_debug(),
    }
