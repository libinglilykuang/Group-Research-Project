resource "azurerm_storage_table" "ip_configurations_table" {
  name                 = "ipconfigurations"
  storage_account_name = azurerm_storage_account.IP_storage_account.name
}

data "azurerm_storage_account_sas" "table_sas" {
  connection_string = azurerm_storage_account.IP_storage_account.primary_connection_string
  https_only        = true

  resource_types {
    service   = true
    container = false
    object    = true
  }

  services {
    blob  = false
    queue = false
    table = true
    file  = false
  }

  start  = "2025-01-01T00:00:00Z"
  expiry = "2026-01-01T00:00:00Z"

  permissions {
    read    = true
    write   = true
    delete  = true
    list    = true
    add     = true
    create  = true
    update  = true
    process = false
    filter  = false  # Added to satisfy newer schema
    tag     = false  # Added to satisfy newer schema
  }

  depends_on = [azurerm_storage_account.IP_storage_account]
}

output "table_sas_token" {
  value       = data.azurerm_storage_account_sas.table_sas.sas
  sensitive   = true
  description = "SAS token for accessing the ipconfigurations table"
}
