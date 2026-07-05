#!/usr/bin/env bash
# Fix the production visitor counter on the v2 Static Web App by setting the
# AZURE_STORAGE_CONNECTION_STRING app setting. Reuses the connection string
# already present in api/local.settings.json so no secret is typed by hand.
#
# Usage: az login   # first, if your token has expired
#        ./scripts/fix-prod-counter.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SETTINGS="$REPO_ROOT/api/local.settings.json"
HOSTNAME_MATCH="zealous-plant-0e47dbd0f"

echo "==> Reading connection string from api/local.settings.json"
CONN="$(python3 -c "import json,sys; print(json.load(open('$SETTINGS'))['Values']['AZURE_STORAGE_CONNECTION_STRING'])")"
[ -n "$CONN" ] || { echo "ERROR: AZURE_STORAGE_CONNECTION_STRING not found in local.settings.json"; exit 1; }

echo "==> Locating the Static Web App (hostname contains '$HOSTNAME_MATCH')"
read -r SWA_NAME SWA_RG < <(az staticwebapp list \
  --query "[?contains(defaultHostname, '$HOSTNAME_MATCH')].[name, resourceGroup]" -o tsv | head -1)
[ -n "${SWA_NAME:-}" ] || { echo "ERROR: could not find a Static Web App with that hostname. Run 'az login' first?"; exit 1; }
echo "    Found: $SWA_NAME  (resource group: $SWA_RG)"

echo "==> Setting AZURE_STORAGE_CONNECTION_STRING app setting"
az staticwebapp appsettings set \
  --name "$SWA_NAME" \
  --resource-group "$SWA_RG" \
  --setting-names "AZURE_STORAGE_CONNECTION_STRING=$CONN" \
  -o none
echo "    Done."

echo "==> Verifying the live counter (allow ~30s for the Functions host to pick up the setting)"
sleep 20
BASE="https://${HOSTNAME_MATCH}.1.azurestaticapps.net"
for i in 1 2 3; do
  RESP="$(curl -s --max-time 15 "$BASE/api/counter" || true)"
  echo "    /api/counter -> $RESP"
  case "$RESP" in
    *'"count"'*) echo "==> SUCCESS: counter is live."; exit 0 ;;
  esac
  sleep 10
done
echo "==> Setting applied, but the counter did not return a count yet. Give it another minute and retry:"
echo "    curl -s $BASE/api/counter"
