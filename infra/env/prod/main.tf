// Prod environment referencing module placeholders. This file intentionally does not declare resources directly.

module "static_site_storage" {
  source = "../../modules/storage_static"

  # Expected inputs:
  # storage_account_name = "..."
  # resource_group_name  = "..."
}

module "cdn" {
  source = "../../modules/cdn"

  # cdn_profile_name = "..."
  # resource_group   = "..."
}

module "functions" {
  source = "../../modules/function_app"

  # function_app_name = "..."
}

module "cosmos" {
  source = "../../modules/cosmosdb"

  # cosmos_account_name = "..."
}

module "ai" {
  source = "../../modules/app_insights"

  # app_insights_name = "..."
}
