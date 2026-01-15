IMPORT PLAN (placeholder)

This file documents the terraform import commands to map existing Azure resources into Terraform state. Replace <...> placeholders with actual resource IDs.

Examples (fill resource IDs):

# Storage account (static website)
terraform import module.static_site_storage.azurerm_storage_account.static "/subscriptions/<SUB>/resourceGroups/<RG>/providers/Microsoft.Storage/storageAccounts/<STORAGE_NAME>"

# CDN profile and endpoint
terraform import module.cdn.azurerm_cdn_profile.cdn "/subscriptions/<SUB>/resourceGroups/<RG>/providers/Microsoft.Cdn/profiles/<CDN_PROFILE>"
terraform import module.cdn.azurerm_cdn_endpoint.endpoint "/subscriptions/<SUB>/resourceGroups/<RG>/providers/Microsoft.Cdn/profiles/<CDN_PROFILE>/endpoints/<ENDPOINT>"

# Function App
terraform import module.functions.azurerm_function_app.function "/subscriptions/<SUB>/resourceGroups/<RG>/providers/Microsoft.Web/sites/<FUNCTION_NAME>"

# Cosmos DB account
terraform import module.cosmos.azurerm_cosmosdb_account.cosmos "/subscriptions/<SUB>/resourceGroups/<RG>/providers/Microsoft.DocumentDB/databaseAccounts/<COSMOS_NAME>"

# Application Insights
terraform import module.ai.azurerm_application_insights.ai "/subscriptions/<SUB>/resourceGroups/<RG>/providers/microsoft.insights/components/<AI_NAME>"

Procedure:
1) Configure backend using `infra/env/prod/backend.tf.tpl` (copy to `backend.tf` and replace placeholders).
2) Initialize terraform: `terraform init` in `infra/env/prod`.
3) Verify plan: `terraform plan` (should show no changes if import-only).
4) Import resources (one-by-one) using commands above, adjusted for correct resource IDs.
5) Run `terraform plan` again to ensure resources are now managed by Terraform state.

Important: Do not run `terraform apply` until you have reviewed resource definitions and ensured variable values match existing resources. This workflow is import-first and non-destructive by intention.
