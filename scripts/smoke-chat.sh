#!/usr/bin/env bash
set -euo pipefail

CHAT_URL="${CHAT_URL:-http://localhost:7071/api/chat}"
QUESTION="${1:-What Azure Government experience does Michael have?}"
ORIGIN="${ORIGIN:-http://localhost:5173}"

echo "POST ${CHAT_URL}"
echo "Question: ${QUESTION}"
echo

curl -sS -i \
  -X POST "${CHAT_URL}" \
  -H "Content-Type: application/json" \
  -H "Origin: ${ORIGIN}" \
  -d "{\"question\":\"${QUESTION}\"}"
