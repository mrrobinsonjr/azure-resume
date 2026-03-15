# Resume Site v2 Promotion Readiness

This document prepares `site-v2` for hosted Azure Static Web Apps promotion. It does **not** switch production traffic by itself.

## Current Status

- Current production workflow: `.github/workflows/azure-static-web-apps.yml`
- Current production static app path: `frontend`
- Current production API path: `api`
- Current production output path: `""` (plain static assets)
- Current repo topology keeps v1 live. `site-v2` is not promoted by this ticket.

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
