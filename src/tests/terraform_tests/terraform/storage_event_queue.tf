resource "azurerm_storage_queue" "IP_fifo_queue" {
  name                 = "ip-fifo-queue"
  storage_account_name = azurerm_storage_account.IP_storage_account.name
}
