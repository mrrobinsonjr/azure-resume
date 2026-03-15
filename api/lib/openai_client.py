from __future__ import annotations

import json
import os
from urllib import error, request


def _chat_deployment() -> str | None:
    return os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT") or os.getenv("AZURE_OPENAI_DEPLOYMENT")


def chat_configured() -> bool:
    required = [
        "AZURE_OPENAI_ENDPOINT",
        "AZURE_OPENAI_API_KEY",
        "AZURE_OPENAI_API_VERSION",
    ]
    return all(os.getenv(key) for key in required) and bool(_chat_deployment())


def embeddings_configured() -> bool:
    required = [
        "AZURE_OPENAI_ENDPOINT",
        "AZURE_OPENAI_API_KEY",
        "AZURE_OPENAI_API_VERSION",
        "AZURE_OPENAI_EMBEDDING_DEPLOYMENT",
    ]
    return all(os.getenv(key) for key in required)


def _request_json(url: str, payload: dict) -> dict:
    api_key = os.environ["AZURE_OPENAI_API_KEY"]
    req = request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "api-key": api_key,
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Azure OpenAI request failed: {exc.code} {detail}") from exc


def chat_completion(messages: list[dict]) -> str:
    endpoint = os.environ["AZURE_OPENAI_ENDPOINT"].rstrip("/")
    deployment = _chat_deployment()
    api_version = os.environ["AZURE_OPENAI_API_VERSION"]
    if not deployment:
        raise RuntimeError("Azure OpenAI chat deployment is not configured")

    url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version={api_version}"
    payload = {
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 400,
    }
    body = _request_json(url, payload)
    return body["choices"][0]["message"]["content"].strip()


def embedding_for_text(text: str) -> list[float]:
    endpoint = os.environ["AZURE_OPENAI_ENDPOINT"].rstrip("/")
    deployment = os.environ["AZURE_OPENAI_EMBEDDING_DEPLOYMENT"]
    api_version = os.environ["AZURE_OPENAI_API_VERSION"]

    url = f"{endpoint}/openai/deployments/{deployment}/embeddings?api-version={api_version}"
    payload = {"input": text}
    body = _request_json(url, payload)
    return body["data"][0]["embedding"]
