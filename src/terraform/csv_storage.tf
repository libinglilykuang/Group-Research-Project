resource "azurerm_storage_account" "csv_storage" {
  name                     = "ipteam6csvstorage"
  resource_group_name      = azurerm_resource_group.IP_resource_group.name
  location                 = azurerm_resource_group.IP_resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags = {
    "environment" = "dev"
    "purpose"     = "csv-uploads"
  }
}

# Blob Container
resource "azurerm_storage_container" "csv_uploads" {
  name                  = "csv-uploads"
  storage_account_name  = azurerm_storage_account.csv_storage.name
  container_access_type = "private"
}

# Output Storage Details
output "storage_account_name" {
  value = azurerm_storage_account.csv_storage.name
}

output "csv_container_name" {
  value = azurerm_storage_container.csv_uploads.name
}
