#!/bin/bash

# Configuration
FUNCTION_APP_NAME="ip-team6-compression-function"
RESOURCE_GROUP="IP-resource-group-wrapper"
FUNCTION_DIR="AzureCompressionFunction"
DOTNET_VERSION="8.0"

# Colours for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Colour

# Function to check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed. Please install it first.${NC}"
        exit 1
    fi
}

# Step 1: Check prerequisites
echo -e "${GREEN}Checking prerequisites...${NC}"
check_command "dotnet"
check_command "func"
check_command "az"
check_command "npm"

# Step 2: Ensure Azure CLI is logged in
echo -e "${GREEN}Checking Azure CLI login...${NC}"
if ! az account show &> /dev/null; then
    echo "Not logged in to Azure CLI. Logging in now..."
    az login || { echo -e "${RED}Azure login failed.${NC}"; exit 1; }
fi

# Step 3: Navigate to function directory
cd "$FUNCTION_DIR" || { echo -e "${RED}Directory $FUNCTION_DIR not found.${NC}"; exit 1; }

# Step 4: Clean and rebuild
echo -e "${GREEN}Cleaning and rebuilding the project...${NC}"
dotnet clean || { echo -e "${RED}Clean failed.${NC}"; exit 1; }
rm -rf bin/ obj/
dotnet restore || { echo -e "${RED}Restore failed.${NC}"; exit 1; }
dotnet build --configuration Release || { echo -e "${RED}Build failed.${NC}"; exit 1; }
dotnet publish --configuration Release || { echo -e "${RED}Publish failed.${NC}"; exit 1; }

# Step 5: Deploy to Azure
echo -e "${GREEN}Deploying to Azure Function App: $FUNCTION_APP_NAME...${NC}"
func azure functionapp publish "$FUNCTION_APP_NAME" --dotnet-isolated || { echo -e "${RED}Deployment failed.${NC}"; exit 1; }

# Step 6: Get function key
echo -e "${GREEN}Retrieving function key...${NC}"
FUNCTION_KEY=$(az functionapp function keys list \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FUNCTION_APP_NAME" \
  --function-name "CompressData" \
  --query "default" -o tsv) || { echo -e "${RED}Failed to retrieve function key.${NC}"; exit 1; }
echo "Function Key: $FUNCTION_KEY"

# Step 7: Test the function
echo -e "${GREEN}Testing the deployed function...${NC}"
TEST_URL="https://$FUNCTION_APP_NAME.azurewebsites.net/api/compressdata?code=$FUNCTION_KEY"
TEST_PAYLOAD='{"rawData":[{"timestamp":"2025-04-04T10:00:00Z","value":100},{"timestamp":"2025-04T10:00:01Z","value":101}],"parameters":{"deviationLimit":2,"deviationType":"Percentage"}}'
curl -X POST -H "Content-Type: application/json" -d "$TEST_PAYLOAD" "$TEST_URL" && echo -e "\n${GREEN}Test succeeded!${NC}" || echo -e "${RED}Test failed.${NC}"

echo -e "${GREEN}Deployment complete!${NC}"
