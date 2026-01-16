# CI/CD Workflows

This folder contains workflows for the frontend and backend deployments.

- `frontend.main.yml` — deploys the static `frontend/` folder to Azure Blob Storage and purges the CDN when `frontend/**` changes are pushed to `main`.
- `backend.main.yml` — builds and deploys the backend Azure Function App when `backend/**` changes are pushed to `main`.

Requirements:
- `secrets.AZURE_CREDENTIALS` — JSON service principal for Azure CLI login.
- `secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE` — publish profile XML for Function App deploy (used by backend workflow).

Note: Hugo `site/` deployment was removed; the active site content is in `frontend/`.
