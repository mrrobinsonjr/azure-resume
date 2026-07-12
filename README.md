# Azure Cloud Resume Challenge

A cloud résumé for Michael Robinson, deployed on Azure Static Web Apps.

**Production:** https://www.blackstatic.cloud (also https://www.blackstatic.cloud/resume)

The live site is the **v2** app: a React + Vite + Tailwind single-page résumé with a
retrieval-grounded (RAG) recruiter chat backed by Azure OpenAI, plus a visitor counter
persisted in Azure Table Storage.

## Architecture

- **`site-v2/`** — production front end (React + Vite + Tailwind SPA)
  - Hero, an expandable reverse-chronological experience timeline, contact actions,
    a secondary "Ask about my experience" RAG chat panel, and a footer visitor counter.
  - Role content is authored as Markdown-with-frontmatter in `site-v2/content/roles/`
    and compiled by a build step (see [Content pipeline](#content-pipeline)).
  - `site-v2/public/staticwebapp.config.json` provides SPA `navigationFallback` so
    client paths such as `/resume` serve the app.

- **`api/`** — Azure Functions (Python, HTTP-triggered)
  - `GET /api/counter` and `POST /api/counter/increment` — visitor counter in Azure Table Storage.
  - `POST /api/chat` — RAG recruiter chat over the résumé content (Azure OpenAI).
  - `lib/` holds the retrieval, prompt, OpenAI client, origin, and rate-limit helpers.

- **`frontend/`** — the original v1 static site (plain HTML/CSS/JS). **Legacy**, retained
  only as a rollback target; not deployed.

- **`content/`, `src/`** — earlier content experiments; the authoritative content the live
  site builds from lives under `site-v2/content/`.

### Project structure

```text
.
├── README.md
├── site-v2/                     # production front end (React + Vite + Tailwind)
│   ├── content/                 # authoritative résumé content
│   │   ├── roles/*.md           # one file per role (frontmatter + body)
│   │   └── resume/summary.md
│   ├── public/
│   │   ├── downloads/           # resume.pdf, resume.docx
│   │   └── staticwebapp.config.json
│   ├── scripts/                 # build-content.mjs, build-rag.mjs
│   └── src/                     # React app (data/profile.ts, pages, components)
├── api/                         # Azure Functions (Python)
│   ├── function_app.py          # counter + chat routes
│   ├── data/                    # rag_chunks.json, rag_embeddings.json (build artifacts)
│   └── lib/                     # retrieval, prompt, openai_client, origin, rate_limit
├── frontend/                    # legacy v1 static site (rollback only)
├── docs/site-v2-promotion.md    # promotion + rollback runbook
└── .github/workflows/
    └── azure-static-web-apps.yml
```

## Local development

### Prerequisites

- Node.js 20+
- Python 3.10+
- Azure Functions Core Tools v4

### Front end (site-v2)

```bash
cd site-v2
npm ci
npm run dev            # Vite dev server on http://localhost:5173
```

`npm run dev` first runs the content pipeline (below), then starts Vite. When talking to a
local API, the app calls `http://localhost:7071/api`; in production it calls `/api`.

### API (Azure Functions)

```bash
cd api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp local.settings.json.example local.settings.json    # then fill in values
func start                                             # http://localhost:7071
```

Quick checks:

```bash
curl http://localhost:7071/api/counter
curl -X POST http://localhost:7071/api/counter/increment -H "Origin: http://localhost:5173"
curl -X POST http://localhost:7071/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Michael'\''s current role?"}'
```

Without Azure OpenAI configured, `POST /api/chat` returns deterministic **mock/fallback**
responses so the UI still works locally.

## Content pipeline

Roles and summary under `site-v2/content/` are compiled into the data the app and the chat use:

```bash
cd site-v2
npm run build:content   # content/roles/*.md  -> src/data/roles.json (sorted newest-first)
npm run build:rag       # content -> api/data/rag_chunks.json (+ rag_embeddings.json)
```

- `build:rag` always writes `api/data/rag_chunks.json`.
- It writes `api/data/rag_embeddings.json` **only** when the Azure OpenAI embedding env vars
  are configured; otherwise it keeps the committed artifact. The committed embeddings artifact
  is what ships to production, so regenerate and commit it after changing role content.

To add a role: create `site-v2/content/roles/<slug>.md` with frontmatter
(`id, company, title, location, start, end, il_levels, tags, tech, highlights`)
and a Markdown body, then re-run the pipeline.

## Chat: configuration and abuse controls

### Environment variables

Runtime settings live on the Static Web App (and in `api/local.settings.json` for local dev):

| Variable | Purpose |
|---|---|
| `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_API_KEY` / `AZURE_OPENAI_API_VERSION` | Azure OpenAI access |
| `AZURE_OPENAI_CHAT_DEPLOYMENT` | chat model deployment (`AZURE_OPENAI_DEPLOYMENT` accepted for back-compat) |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | embedding model deployment |
| `AZURE_STORAGE_CONNECTION_STRING` | Table Storage for the counter **and** durable rate limiting |
| `ALLOWED_ORIGINS` | comma-separated exact origins allowed to call chat/counter |
| `CHAT_RATE_LIMIT_WINDOW_SECONDS` | rate-limit window (default `600`) |
| `CHAT_RATE_LIMIT_MAX_REQUESTS` | max chat requests per IP per window (default `20`) |
| `CHAT_DEBUG` | when truthy, includes diagnostic fields in error responses (**off** in production) |

### Abuse / safety controls on `POST /api/chat`

- **Origin allowlist** — non-allowlisted browser origins get `403`. A missing `Origin` is
  permitted for manual/CLI testing.
- **Rate limiting** — per-IP, two layers: a fast in-memory limiter plus a **durable**
  Table Storage–backed limiter (`ChatRateLimit` table) that holds across cold starts and
  multiple instances. Over budget returns `429`. Fails open on storage errors.
- **Input caps** — request bodies over 16 KB return `413`; questions over 2000 characters
  return `400`.
- **Output cap** — responses are bounded (`max_tokens`, low temperature, request timeout).
- **Prompt-injection hardening** — the system prompt answers only from retrieved context and
  treats source content as data, ignoring instructions embedded in it.
- **No information disclosure** — errors return generic messages; internal exception text and
  the origin allowlist are never returned unless `CHAT_DEBUG` is enabled.

## Deployment (Azure Static Web Apps)

Production deploys from **`main`** via `.github/workflows/azure-static-web-apps.yml`:

- `app_location: site-v2`
- `api_location: api`
- `output_location: dist`

Pushing to `main` builds `site-v2` (which runs the content pipeline) and deploys it plus the
`api` Functions to the production Static Web App, served at `www.blackstatic.cloud`.

Runtime application settings (Azure OpenAI, `ALLOWED_ORIGINS`, rate-limit vars,
`AZURE_STORAGE_CONNECTION_STRING`) are configured on the Static Web App resource, not in the repo.

### Custom domains

- `www.blackstatic.cloud` — CNAME to the Static Web App (primary).
- `blackstatic.cloud` (apex) — A record + TXT validation (see `docs/site-v2-promotion.md`).

### Promotion & rollback

The v1 → v2 cutover history, and the rollback procedure (revert the workflow change so
production serves `frontend/` again), are documented in
[`docs/site-v2-promotion.md`](docs/site-v2-promotion.md).

## Notes

- `local.settings.json` is intentionally excluded from git.
- The counter persists in Azure Table Storage and returns `{ "count": <int> }`. The front end
  reads `GET /api/counter` and increments once per browser session via
  `POST /api/counter/increment`.
- `POST /api/counter/increment` requires an allowed `Origin`; call it with curl/Postman using
  `-H "Origin: <allowed-origin>"`.
