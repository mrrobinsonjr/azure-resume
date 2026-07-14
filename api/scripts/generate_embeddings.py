#!/usr/bin/env python3
"""Generate embeddings for all RAG chunks."""

import json
import os
import sys
from pathlib import Path

# Add API directory to path so we can import lib module
SCRIPT_DIR = Path(__file__).resolve()
API_DIR = SCRIPT_DIR.parent
ROOT_DIR = API_DIR.parent  # Project root

if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

from lib.openai_client import embedding_for_text, embeddings_configured

DATA_DIR = API_DIR / "data"
CHUNKS_PATH = DATA_DIR / "rag_chunks.json"
EMBEDDINGS_PATH = DATA_DIR / "rag_embeddings.json"


def main():
    print(f"Loading chunks from {CHUNKS_PATH}...")

    if not CHUNKS_PATH.exists():
        print(f"ERROR: Chunks file not found at {CHUNKS_PATH}")
        return 1

    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data.get("chunks", [])
    print(f"Found {len(chunks)} chunks")

    if not embeddings_configured():
        print("WARNING: Azure OpenAI embedding env vars are not configured.")
        print("Generating empty embeddings file. Run with proper env vars to create real embeddings.")

        # Create empty embeddings structure
        result = {
            "generated_at": "",
            "count": 0,
            "embeddings": []
        }

        with open(EMBEDDINGS_PATH, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)

        print(f"Empty embeddings file written to {EMBEDDINGS_PATH}")
        return 0

    print("Generating embeddings...")
    embeddings = []

    for i, chunk in enumerate(chunks, 1):
        chunk_id = chunk.get("id", f"unknown-{i}")
        text = chunk.get("text", "")

        if not text.strip():
            print(f"  [{i}/{len(chunks)}] SKIPPED {chunk_id} (empty text)")
            continue

        try:
            vector = embedding_for_text(text)
            embeddings.append({
                "id": chunk_id,
                "vector": vector
            })
            print(f"  [{i}/{len(chunks)}] OK {chunk_id} ({len(vector)} dims)")
        except Exception as e:
            print(f"  [{i}/{len(chunks)}] ERROR {chunk_id}: {e}")

    result = {
        "generated_at": "",
        "count": len(embeddings),
        "embeddings": embeddings
    }

    with open(EMBEDDINGS_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"\nGenerated {len(embeddings)} embeddings")
    print(f"Written to {EMBEDDINGS_PATH}")
    return 0


if __name__ == "__main__":
    exit(main())
