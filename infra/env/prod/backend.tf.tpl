# Backend template for Terraform state using Azure Storage Account
# Fill in values or render via CI

terraform {
  backend "azurerm" {
    resource_group_name  = "<resource-group>"
    storage_account_name = "<storage-account>"
    container_name       = "<container>"
    key                  = "<path/to/terraform.tfstate>"
  }
}
