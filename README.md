# Azure Cloud Resume Challenge

Minimal starter scaffold for a Cloud Resume Challenge implementation using:
- Plain HTML/CSS frontend in `frontend/`
- Python Azure Functions API in `api/`

## Architecture

- Frontend (`frontend/`)
  - Static site assets (`index.html`, `styles.css`)
  - Calls API endpoint for visitor count

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
│   └── styles.css
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
