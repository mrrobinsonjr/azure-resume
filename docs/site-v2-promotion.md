# Resume Site v2 Promotion Readiness

This document prepared `site-v2` for hosted Azure Static Web Apps promotion. The cutover has since been performed — see below.

## ✅ Cutover Completed — 2026-07-05

`site-v2` is now the production site served at **https://www.blackstatic.cloud**.

Strategy used: **A — swap content, keep the domain** (no DNS changes).

What was done:

1. Copied the Azure OpenAI settings and set `ALLOWED_ORIGINS` (including `https://www.blackstatic.cloud`) on the production SWA `mrr-azureresume-swa`.
2. Repointed `.github/workflows/azure-static-web-apps.yml` to build the v2 app: `app_location: site-v2`, `api_location: api`, `output_location: dist`.
3. Merged `site-v2-phase3b-rag` → `main`; the push triggered the production deploy.
4. Added `site-v2/public/staticwebapp.config.json` (SPA `navigationFallback`) so client-side paths such as `/resume` serve the app.
5. Retired the redundant preview resource: deleted the `mrr-azureresumev2-swa` Static Web App and removed its `azure-static-web-apps-zealous-plant-0e47dbd0f.yml` workflow.

Verified live: page/design, grounded chat (`azure_openai_rag`), visitor counter, and origin enforcement (allowed → 200, disallowed → 403).

### Rollback

Revert the workflow commit on `main` and push. Production returns to `app_location: frontend` / `output_location: ""`; the v1 assets remain in `frontend/`. Then re-run `./scripts/smoke-chat-hosted.sh https://www.blackstatic.cloud` and confirm the v1 resume and `/api/counter` behavior.

### Open items

- The bare apex `blackstatic.cloud` is **not** configured — only `www.blackstatic.cloud` resolves. Adding the apex requires a DNS custom-domain step.

## Current Status (pre-cutover, for reference)

- Former production static app path: `frontend`
- Production API path: `api`
- Before cutover, repo topology kept v1 live and `site-v2` unpromoted.

## Chosen Strategy

Strategy A: keep v1 and v2 side-by-side with a separate manual preview/staging workflow for v2.

Why this path:

- it leaves the current v1 production workflow untouched
- it allows validating `site-v2` on a separate SWA resource before any cutover
- rollback remains a no-op until a later cutover PR intentionally changes production

## Preview Workflow

- Preview workflow: `.github/workflows/swa-site-v2.yml`
- Trigger: manual `workflow_dispatch`
- Static app path: `site-v2`
- API path: `api`
- Output path: `dist`
- Required deploy secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_SITE_V2`

The preview workflow passes Azure OpenAI secrets into the build so `npm run build:rag` can generate embeddings if they are configured. If those build-time secrets are missing, the deploy still works, but chat will stay in mock/fallback mode.

## Hosted Configuration

### Build-time GitHub Actions secrets

These are used by `.github/workflows/swa-site-v2.yml` during the `site-v2` build:

- `AZURE_STATIC_WEB_APPS_API_TOKEN_SITE_V2`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_CHAT_DEPLOYMENT`
- `AZURE_OPENAI_EMBEDDING_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION`

### Runtime Azure Static Web Apps application settings

These belong in the SWA resource configuration for the Functions runtime:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_CHAT_DEPLOYMENT`
- `AZURE_OPENAI_EMBEDDING_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION`
- `ALLOWED_ORIGINS`
- `CHAT_RATE_LIMIT_WINDOW_SECONDS`
- `CHAT_RATE_LIMIT_MAX_REQUESTS`
- `AZURE_OPENAI_DEPLOYMENT` (optional backward-compatible chat deployment name)

### Origin guidance

- Production custom domain: include the final production domain in `ALLOWED_ORIGINS`
- Preview domain: include the preview SWA hostname in `ALLOWED_ORIGINS`
- Local dev: include `http://localhost:5173`
- Browser calls must match the allowlist exactly
- Missing `Origin` is still allowed for local/manual smoke testing

## Preview Validation Checklist

1. Run the manual preview workflow `.github/workflows/swa-site-v2.yml`
2. Confirm the preview SWA deploys `site-v2` and `api`
3. Set runtime application settings in the preview SWA
4. Run:
   - `./scripts/smoke-chat-hosted.sh <preview-url>`
5. Validate manually in the browser:
   - page loads
   - roles grid/search work
   - recruiter chat returns `answer`, `citations`, `grounded`, and `mode`
   - blocked-origin behavior returns `403`
   - repeated chat requests eventually return `429`

## Production Cutover Checklist

This ticket does **not** perform the cutover. When you are ready to promote:

1. Confirm preview validation has passed
2. Confirm production SWA runtime settings are configured:
   - Azure OpenAI vars
   - `ALLOWED_ORIGINS`
   - chat rate-limit vars
3. Update `.github/workflows/azure-static-web-apps.yml` so production deploys:
   - `app_location: site-v2`
   - `api_location: api`
   - `output_location: dist`
4. Merge that workflow-only cutover PR
5. After deploy, run:
   - `./scripts/smoke-chat-hosted.sh <production-url>`
6. Validate:
   - custom domain routing
   - `/api/chat` success from allowed origin
   - search/filter/role cards
   - chat mode and citations

## Rollback Checklist

If cutover causes issues:

1. Revert the cutover PR that changed `.github/workflows/azure-static-web-apps.yml`
2. Redeploy the reverted commit so production points back to:
   - `app_location: frontend`
   - `api_location: api`
   - `output_location: ""`
3. Re-run:
   - `./scripts/smoke-chat-hosted.sh <production-url>`
4. Confirm v1 resume and `/api/counter` behavior are restored

## Hosted Smoke Test Commands

```bash
./scripts/smoke-chat-hosted.sh https://preview.example.com
./scripts/smoke-chat-hosted.sh https://www.example.com "Which roles best match a cloud architect position?"
```

Blocked-origin check:

```bash
ORIGIN=https://not-allowed.example ALLOW_NON_200_CHAT=1 \
  ./scripts/smoke-chat-hosted.sh https://preview.example.com
```
