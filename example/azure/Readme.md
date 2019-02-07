# Deploy the Serverless Example Case

## What does it do?

The example contains Azure functions in one single Function App ('container for functions which share the same libraries'). The function listens for images in specified containers on an Azure blob storage and resizes them into three different sizes. Additionally jpeg exif data is extracted and saved into an Azure CosmosDB database.

The folder monitor-api contains a quick-and-dirty idea how querying the Azure Monitor API could work. It is not automatically deployed.

## Important notice on costs

Running the example might cause costs in a paid subscribtion. Costs of the VM and the functions should be irrelevant (< 7$ per month) but CosmosDB can get expensive really fast if the free monthly grant is used (caused by reserved throughput of Collections). An empty CosmosDB should be more or less free. Azure Storage also charges you for used storage space and especially Read/Write operations. Network traffic should be irrelevant as the example case doesn't cause a lot of network traffic. Check your costs on a regular basis or simply delete the whole resource group if you're done. Functions and VMs can be stopped. Stopped VMs still cost money because of about 30GB reserved disk space, even if it is not used.

## Architecture of the Serverless Example

This example for Azure contains the following elements:

- Two types of processing: Functions using the normal, 'loose' way of data processing (using queues) and Durable Functions (using Azure Durable Functions with an orchestrator function)
- A http trigger function which resizes an image
- Azure storage containing the function code and the blobs (in this case images) to process
- Azure CosmosDB which saves the exif data
- A Prometheus server in a minimal Ubuntu server with Grafana, Pushgateway and Prometheus Aggregator (last two components are necessary for pushing metrics to Prometheus). The Ubuntu server is automatically deployed as an Azure VM

## How to deploy

### Requirements

- Azure Subscription (free is sufficient)
- Azure CLI
- Azure Functions Core Tools (required for full setup only)
- Unix based system to run shell scripts (on Windows commands have to be run manually or write your own Powershell script)
- NodeJS, npm to install all dependencies for the functions and run functions locally
- .net core [download](https://dotnet.microsoft.com/download) has to be installed (required for full setup only)

### Step By Step Full Setup

1. Create an Azure subscribtion (you can get 1 month for free, no credit card necessary)

2. (Optional if you want to edit and deploy functions for yourself) Install .net Core [download](https://dotnet.microsoft.com/download)

3. Install the Azure CLI, download: [Link](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest). The Azure CLI is necessary to manage all resources on Azure for this example without requiring the Azure Portal

4. (Optional if you want to edit and deploy functions for yourself) Install the Azure Functions Core Tools, download: [Link](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#install-the-azure-functions-core-tools). Necessary to deploy the function app to Azure and can be used to execute the function app locally

5. Login to the Azure CLI using `az login`. This should open a new tab in the default browser and you will be asked to login. Alternative ways to login can be found [here](https://docs.microsoft.com/en-us/cli/azure/authenticate-azure-cli?view=azure-cli-latest).

6. Set all settings in [required-settings.properties](required-settings.properties) file apart from cosmosConnectionString. These settings need to be changed because Azure requires unique resource names in some cases. Other settings like the deployment location can be modified in [optional-settings.properties](optional-settings.properties).

7. Run `create-resources.sh` in the functions/image-processor directory. The script will create all necessary resources for the function example to work. The script uses the Azure CLI. Azure CLI commands wait until the resource deployment is finished which can take several minutes in some cases (especially Azure CosmosDB). The script will ask you to directly continue with the VM setup (see next step).

8. Create a virtual machine using `create-vm.sh` which will contain Prometheus, Grafana and components necessary to push metrics to Prometheus. The Prometheus stack is deployed using docker-compose. The virtual machine uses the cheapest VM size available (should cost below 5$ per month or even less although it runs 24/7). The VM is not very fast but sufficient for Prometheus and Grafana. You can skip this step if you already have a server which can open ports so the functions can push metrics to Prometheus.

9. Verify that Prometheus is working by opening `<vm-address>:9090`. You should be able to see the Prometheus UI. It might take some minutes until Prometheus is ready after starting the stack. In case the vm address is wrong you can manually enter the correct address in `optional-settings.properties`

10. Get the CosmosDB Connection String manually from the Azure Portal (not possible with Azure CLI due to current bug). You can find the connection string in the Cosmos DB Account in the Azure Portal at: Click on "Azure Cosmos DB" on the left side (if not visible use search at the top). Select the serverless example database (should be the only cosmos db). Then select Keys in the Settings section. Copy the value of `PRIMARY CONNECTION STRING`. Set the connection string in `required-settings.properties` at `cosmosConnectionString`.

11. Run `setup-function-app.sh` to set the necessary environment variables for the function app in the cloud. These variables contain the addresses for pushing metrics and the CosmosDB connection string. It also uploads the latest function release

12. (Optional if you want to deploy a modified version of the example functions. Requires npm, dotnet core and azure function core tools) Deploy the function content by running `deploy-function-app.sh`. This zips the image-processor-app content and uploads it to Azure. Azure runs the function app from the package. Therefore you can be sure that the correct app content gets executed.

13. Open Grafana: In the browser type `<vm-address>:3000` with your VM address and login to Grafana with username 'admin' and password 'foobar' unless changed in prometheus-stack/grafana/config.monitoring. First go to settings and add the data source Prometheus with the address `http://prometheus:9090`. Set the scrape interval to 5s. Save the data source. To add a dashboard, mouseover the plus sign on the left side and select 'Import' and paste the content of [grafana_dashboards.json](grafana_dashboards.json) (or just upload the file).

14. Run `upload-images-durable.sh` or `upload-images-queue.sh` to upload the test images to Azure blob storage. They will then be processed which you can see in Grafana. Azure Blob Triggers can take up to 10 minutes until they trigger.

### Step By Step VM Only

1. Create an Azure subscribtion (you can get 1 month for free, no credit card necessary)

2. Install the Azure CLI, download: [Link](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest). The Azure CLI is necessary to manage all resources on Azure for this example without requiring the Azure Portal

3. Set the virtual machine dns name in required-settings.properties

4. Create a virtual machine using `create-vm.sh` which will contain Prometheus, Grafana and components necessary to push metrics to Prometheus. You will be prompted to enter your password at the end of the script to copy the prometheus-stack folder to the VM. The virtual machine uses the cheapest VM size available (should cost below 5$ per month or even less although it runs 24/7). The VM is not very fast but sufficient for Prometheus and Grafana. You can skip this step if you already have a server which can open ports so the functions can push metrics to Prometheus

5. Verify that Prometheus is working by opening `<vm-address>:9090`. You should be able to see the Prometheus UI. It might take some minutes until Prometheus is ready after starting the stack.

## Delete Resources

The easiest way to delete all resources is by deleting the whole resource group. You can do this either by using the Azure Portal or the Azure CLI.

The Azure Functions example and the VM are in different resource groups. You can find the names of the resource groups in optional-settings.properties.
