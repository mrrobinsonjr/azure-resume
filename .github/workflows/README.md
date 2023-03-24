# Deploy Frontend

This GitHub Actions workflow is responsible for deploying the frontend of the Azure Resume project to Azure Blob Storage whenever there's a push to the `main` branch that affects files in the `frontend` folder. The workflow is defined in the `.github/workflows/deploy_frontend.yml` file.

## Workflow Steps

1. Checkout the repository code.
2. Login to Azure using the Azure CLI and the provided credentials.
3. Upload the contents of the `frontend` folder to Azure Blob Storage, using the specified account name and destination path.
4. Purge the CDN endpoint to refresh the content in the cache.
5. Logout from Azure CLI.

## Requirements

- The workflow requires `secrets.AZURE_CREDENTIALS` to be set in the repository's secrets, containing the JSON representation of the Azure Service Principal.


# Deploy Backend

This GitHub Actions workflow is responsible for deploying the backend of the Azure Resume project to Azure Function App whenever there's a push to the `main` branch that affects files in the `backend` folder. The workflow is defined in the `.github/workflows/deploy_backend.yml` file.

## Workflow Steps

1. Checkout the repository code.
2. Login to Azure using the Azure CLI and the provided credentials.
3. Setup the .NET Core environment with the specified version.
4. Build the project and resolve dependencies.
5. Run the unit tests for the project.
6. Deploy the project to Azure Function App.
7. Logout from Azure CLI.

## Requirements

- The workflow requires `secrets.AZURE_CREDENTIALS` to be set in the repository's secrets, containing the JSON representation of the Azure Service Principal.
- The workflow requires `secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE` to be set in the repository's secrets, containing the publish profile XML for the Azure Function App.
