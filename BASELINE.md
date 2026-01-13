# Baseline – Cloud Resume Challenge (Pre-Refactor)

## Date
2026-01-13

## Live URLs
- Website: https://resume.blackstatic.cloud
- API (visitor counter): https://mrrgetresumecounter-func.azurewebsites.net/api/mrrGetResumeCounter?code=6-F0uG__LaKLQ14BAHykLC--hMgfNFrQ-nFiaMvfGpLXAzFu71Yo-g==

## Frontend
- Location: /frontend
- Framework: vanilla JavaScript (no framework)
- Static hosting: Azure Storage Static Website (served as static HTML/CSS/JS; custom domain resume.blackstatic.cloud)
- Build process: none — plain HTML/CSS/JS (no build or bundler)

## Backend
- Location: /backend/api
- Runtime: .NET 6 (C#) running on Azure Functions v4
- Azure Service: Azure Function App (HTTP-triggered function)
- Purpose: Visitor counter API — increments and returns a counter stored in Cosmos DB via input/output bindings

## Data Store
- Service: Azure Cosmos DB (Core/SQL API) via Functions CosmosDB binding
- Purpose: Store page visit count (single document)
- Schema: document with `id` (string) and `Count` (int). Code expects DB `azureresume`, collection `counter`, document id `"1"`, partition key `"1"`.

## Azure Resources (Current / Inferred)
- Subscription: Azure subscription 1
- Resource Group: mrr-azureresume-rg
- Storage Account: mrrazureresumest
- Function App: mrrgetresumecounter-func (inferred from function host domain)
- Database: azureresume (Cosmos DB), collection `counter`
- DNS Zone: resume.blackstatic.cloud (custom domain)
- CDN / Front Door: (none known)

## Auth / Secrets
- Secrets stored in: Function App Application Settings (Functions setting `AzureResumeConnectionString` is used by the Cosmos DB binding). Local development uses `local.settings.json`.
- CI identity: not configured / no GitHub Actions workflows present in this repo; deployments appear to be manual (publish profile or CLI).

## CI/CD
- Provider: none configured (GitHub Actions recommended)
- Frontend deploy workflow: (none) — static files can be uploaded to Storage account or deployed via GitHub Actions
- Backend deploy workflow: (none) — Function App can be published with `dotnet publish` and `func azure functionapp publish` or via CI

## Known Constraints
- No Terraform currently; infrastructure created manually via Portal/CLI
- Counter endpoint is hardcoded in frontend at `frontend/main.js` (`functionApiURL` variable)

## “Do Not Break”
- Visitor counter increments correctly
- HTTPS works
- Custom domain resolves