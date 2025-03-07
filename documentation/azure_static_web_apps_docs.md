# How Does the UI connect to Azure and how is it hosted?

## Terraform Code

```terraform
resource "azurerm_static_web_app" "ip_react_static_app" {
  name                = "ip-team6-static-webapp"
  resource_group_name = azurerm_resource_group.IP_resource_group.name
  location            = azurerm_resource_group.IP_resource_group.location
  sku_tier            = "Free"
  sku_size            = "Free"

  tags = {
    "environment" = "dev"
  }
}

output "static_app_url" {
  value       = "https://${azurerm_static_web_app.ip_react_static_app.default_host_name}"
  description = "The URL of the deployed React static web app"
}
```

when you do `terraform apply` you will get the token that you can then use when linking it with the `az` command line utility


## Once the React app is built into a zip

run this command

```sh
az staticwebapp secrets list --resource-group IP-resource-group-wrapper --name ip-team6-static-webapp --query "properties.apiKey" --output tsv [YOUR TOKEN]
```

