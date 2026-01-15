Infra folder contains Terraform scaffolding for import-first adoption.

Structure:
- env/prod: production env that references modules (no resources created by default)
- modules/*: module skeletons for storage, cdn, function app, cosmosdb, app insights

This is import-first: do NOT `terraform apply` from these files until you understand the resources and have configured a remote backend.
