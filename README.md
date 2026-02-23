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
  - `function_app.py` defines `resume-counter` route
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
    ├── local.settings.json.example
    └── requirements.txt
```

## Local Development

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

3. Create local settings file:

```bash
cp local.settings.json.example local.settings.json
```

4. Start the Functions host:

```bash
func start
```

Default local API route:
- `http://localhost:7071/api/resume-counter`

## Notes

- `local.settings.json` is intentionally excluded from git.
- Current API response is a placeholder count to validate wiring before storage integration.
