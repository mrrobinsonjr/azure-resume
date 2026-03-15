# Azure Cloud Resume Challenge

Minimal starter scaffold for a Cloud Resume Challenge implementation using:
- Plain HTML/CSS frontend in `frontend/`
- Python Azure Functions API in `api/`

## Architecture

- Frontend (`frontend/`)
  - Static site assets (`index.html`, `styles.css`, `app.js`)
  - Single-page, responsive, accessible resume with sections for Summary, Skills, Experience, Certifications, Education, and Projects
  - Uses `app.js` to fetch visitor count JSON from `/api/counter` and render it in `#visitor-count`

- API (`api/`)
  - Azure Functions (Python, HTTP-trigger)
  - `function_app.py` defines `GET /api/counter` and `POST /api/counter/increment`
  - `host.json` and `requirements.txt` provide Functions runtime config

## Project Structure

```text
.
├── agents.md
├── README.md
├── .gitignore
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── api/
    ├── .funcignore
    ├── function_app.py
    ├── host.json
    ├── local.settings.json
    ├── local.settings.json.example
    └── requirements.txt
```

## Local Development

- Start Functions: cd api && func start
- Start frontend: python -m http.server 8080 --directory frontend
- The code uses localhost:7071 only when running locally; production uses /api

### Resume Site v2 (React + Vite + Tailwind)

```bash
cd site-v2
npm ci
npm run dev
```

Role content pipeline:

```bash
cd site-v2
npm run build:content
```

Build check:

```bash
cd site-v2
npm ci
npm run build
```

### Prerequisites

- Python 3.10+
- Azure Functions Core Tools (v4)

### Frontend

Open `frontend/index.html` directly in a browser during initial development.

### API

1. Create and activate a virtual environment:

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Ensure local settings file exists:

```bash
cp local.settings.json.example local.settings.json
```

4. Start the Functions host:

```bash
func start
```

Local API routes:
- `GET http://localhost:7071/api/counter`
- `POST http://localhost:7071/api/counter/increment`

Quick endpoint checks:

```bash
curl http://localhost:7071/api/counter
curl -X POST http://localhost:7071/api/counter/increment
curl -X POST http://localhost:7071/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What Azure Government experience does Michael have?"}'
```

### Phase 3A Chat Env Vars

For Azure OpenAI-backed chat, set these in your local Functions environment:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION`

If these values are not set, `POST /api/chat` returns a deterministic grounded mock response so the `site-v2` UI still works locally.

## Deployment (Azure Static Web Apps)

- GitHub Actions workflow: `.github/workflows/azure-static-web-apps.yml`
- Frontend app location: `frontend`
- Functions API location: `api`
- Frontend uses `/api` in production, which is routed by Static Web Apps to the Functions backend.

### Deploying site-v2

- GitHub Actions workflow: `.github/workflows/swa-site-v2.yml`
- Required repository secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_SITE_V2`

## Notes

- `local.settings.json` is intentionally excluded from git.
- API persists counter state in Azure Table Storage and returns JSON `{ "count": <int> }`.
- Frontend reads `GET /api/counter` and increments once per tab session via `POST /api/counter/increment`.
- CORS allows `http://localhost:8080` and `https://www.blackstatic.cloud`.
- GET http://localhost:7071/api/counter works in browser
- POST http://localhost:7071/api/counter/increment must be called with curl/Postman (browser will 404)
