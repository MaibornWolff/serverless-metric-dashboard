echo "Important: Please read the Readme in this directory and edit deployment-settings.properties before you proceed. Press enter to proceed or CTRL + C to exit"
echo "CAUTION: Invoking 'create' for an existing resource with the specified names will not cause an error but resets certain app settings in some cases."
echo "This script will take about 10 minutes because of CosmosDB"
read

set -ex

source optional-settings.properties

# Create resource group which will later contain the whole example including any uploaded and processed files
az group create --name $resourceGroup --location $location
# Create locally redundant storage account which will contain the function code and other files
# Storage name has to be globally unique on Azure
az storage account create --name $storageAccount --location $location --resource-group $resourceGroup --sku Standard_LRS
# Get connection string which is needed for container creation
storageConnectionString=$(az storage account show-connection-string --name $storageAccount | cut -d '"' -f4 | sed -n '2p')
# The containers which are used by the example function app
az storage container create --name images-unprocessed-loose --public-access off --connection-string $storageConnectionString
az storage container create --name images-unprocessed-durable --public-access off --connection-string $storageConnectionString
az storage container create --name images-processed-loose --public-access off --connection-string $storageConnectionString
az storage container create --name images-processed-durable --public-access off --connection-string $storageConnectionString
az storage container create --name images-unprocessed-http --public-access off --connection-string $storageConnectionString
az storage container create --name images-processed-http --public-access off --connection-string $storageConnectionString
# Create Azure Cosmos DB
# It can take several minutes for the deployment to finish (up to 15min possible)
# https://docs.microsoft.com/de-de/cli/azure/cosmosdb?view=azure-cli-latest#az-cosmosdb-create
az cosmosdb create --name $databaseAccountName --resource-group $resourceGroup --kind GlobalDocumentDB --default-consistency-level Session
# Create database
az cosmosdb database create --resource-group $resourceGroup --name $databaseAccountName --db-name imagedata
# Create collection
az cosmosdb collection create --resource-group $resourceGroup --name $databaseAccountName --db-name imagedata --collection-name exif --throughput 400
# Create the first function app which is the container for the function code. The name has to be globally unique
az functionapp create --resource-group $resourceGroup --consumption-plan-location $location --name $functionAppName --storage-account $storageAccount
# Setting function app node version to version: $nodeVersion Run https://$functionAppName.scm.azurewebsites.net/api/diagnostics/runtime to see all available version
# This command can take about a minute to finish
az functionapp config appsettings set --resource-group $resourceGroup --name $functionAppName --settings WEBSITE_NODE_DEFAULT_VERSION=$nodeVersion WEBSITE_RUN_FROM_PACKAGE=1
echo "Basic resource deployment finished! The function app is still empty at this point. Next step is the VM deployment"
echo "The VM deployment takes about 10 minutes to finish"
echo "To start VM deployment confirm by typing 'y/Y'"
read -p "Are you sure? " -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1 # handle exits from shell or function but don't exit interactive shell
fi
source create-vm.sh