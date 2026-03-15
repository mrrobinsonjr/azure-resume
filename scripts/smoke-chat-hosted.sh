#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/smoke-chat-hosted.sh <base-url> [question]

Examples:
  ./scripts/smoke-chat-hosted.sh https://preview.example.com
  ./scripts/smoke-chat-hosted.sh https://www.example.com "Which roles best match a cloud architect position?"

Environment overrides:
  ORIGIN                  Origin header to send. Defaults to <base-url>.
  ALLOW_NON_200_CHAT=1    Do not fail on non-200 chat responses (useful for blocked-origin checks).
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" || $# -lt 1 ]]; then
  usage
  exit 0
fi

BASE_URL="${1%/}"
QUESTION="${2:-What Azure Government experience does Michael have?}"
ORIGIN="${ORIGIN:-$BASE_URL}"

echo "Checking home page: ${BASE_URL}"
curl -fsS -o /dev/null -D - "${BASE_URL}" | sed -n '1,8p'
echo

echo "Checking hosted chat: ${BASE_URL}/api/chat"
CHAT_RESPONSE="$(mktemp)"
CHAT_STATUS="$(
  curl -sS \
    -o "${CHAT_RESPONSE}" \
    -w "%{http_code}" \
    -X POST "${BASE_URL}/api/chat" \
    -H "Content-Type: application/json" \
    -H "Origin: ${ORIGIN}" \
    -d "{\"question\":\"${QUESTION}\"}"
)"

echo "Status: ${CHAT_STATUS}"
cat "${CHAT_RESPONSE}"
echo

if [[ "${ALLOW_NON_200_CHAT:-0}" != "1" && "${CHAT_STATUS}" != "200" ]]; then
  echo "Hosted chat smoke test failed with status ${CHAT_STATUS}" >&2
  exit 1
fi
