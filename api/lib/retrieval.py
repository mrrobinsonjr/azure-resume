from __future__ import annotations

import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
ROLES_PATH = BASE_DIR / "site-v2" / "src" / "data" / "roles.json"
SUMMARY_PATH = BASE_DIR / "site-v2" / "content" / "resume" / "summary.md"


def _load_roles() -> list[dict]:
    if not ROLES_PATH.exists():
        return []
    return json.loads(ROLES_PATH.read_text(encoding="utf-8"))


def _load_summary() -> str:
    if not SUMMARY_PATH.exists():
        return ""
    return SUMMARY_PATH.read_text(encoding="utf-8").strip()


def _tokenize(text: str) -> set[str]:
    return {token for token in text.lower().replace("/", " ").replace("-", " ").split() if token}


def retrieve_context(question: str) -> list[dict]:
    query_tokens = _tokenize(question)
    contexts = []

    summary = _load_summary()
    if summary:
        contexts.append(
            {
                "id": "resume-summary",
                "title": "Resume Summary",
                "section": "Summary",
                "content": summary,
                "score": len(query_tokens.intersection(_tokenize(summary))) if query_tokens else 1,
            }
        )

    for role in _load_roles():
        searchable = " ".join(
            [
                role.get("company", ""),
                role.get("title", ""),
                role.get("location", ""),
                " ".join(role.get("highlights", [])),
                " ".join(role.get("tags", [])),
                " ".join(role.get("tech", [])),
                role.get("bodyHtml", ""),
            ]
        )
        contexts.append(
            {
                "id": role["id"],
                "title": role["title"],
                "section": "Highlights",
                "content": searchable,
                "score": len(query_tokens.intersection(_tokenize(searchable))),
            }
        )

    contexts.sort(key=lambda item: item["score"], reverse=True)
    top_matches = [item for item in contexts if item["score"] > 0][:4]
    if top_matches:
        return top_matches
    return contexts[:3]

