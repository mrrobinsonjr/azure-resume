# Backend Config

## Azure resource group
- az group create --name mrr-azureresume-rg --location eastus

## Azure CosmosDB
- az cosmosdb create --name mrr-azureresume --resource-group mrr-azureresume-rg --kind GlobalDocumentDB --locations regionName=eastus --capabilities EnableServerless

## Azure SQL Database 
- az cosmosdb sql database create --account-name mrr-azureresume --resource-group mrr-azureresume-rg --name azureresume

## Azure Databse Container
- az cosmosdb sql container create -a mrr-azureresume -d azureresume -n counter -p /id, /create -g mrr-azureresume-rg

## Azure Storage App
- az storage accoutn create \
   --resource-group mrr-azureresume-rg \
   --name mrrazureresumest \
   --sku Standard_LRS \
   --kind StorageV2 \
   --location eastus
   
## Azure Application Insights
- az monitor app-insights component create \
    --app mrr-azureresume-appi \
    --resource-group mrr-azureresume-rg \
    --location eastus

## Azure FunctionApp
- az functionapp create \
    --resource-group mrr-azureresume-rg \
    --name mrrGetResumeCounter-func \
    --storage-account mrrazureresumest\
    --consumption-plan-location eastus \
    --os-type Linux \
    --runtime dotnet \
    --runtime-version 6 \
    --functions-version 3 \
    --app-insights mrr-azureresume-appi

## Azure Function
- Create a new Azure Functions project in Visual Studio Code:
    -  Open Visual Studio Code.
    - Press Ctrl+Shift+P or Cmd+Shift+P (Mac) to open the Command Palette.
    - Type "Azure Functions" in the Command Palette and select "Azure Functions: Create New Project...".
    - Choose a directory to store your project.
    - Select the desired programming language (C# in your case).
    - Choose a template for your function (e.g., HTTP trigger).
    - Provide a name for your function.
    - Choose an access level for your function (e.g., anonymous, function, or admin).
    - The extension will generate the necessary files, including host.json, local.settings.json, and YourFunctionName.csproj along with the .cs files.

    ## Added Counter class definition