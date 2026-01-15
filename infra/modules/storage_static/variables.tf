variable "storage_account_name" {
  type = string
  description = "Name of the storage account"
}

variable "resource_group_name" {
  type = string
  description = "Resource group containing the storage account"
}

variable "location" {
  type = string
  default = "eastus"
}
