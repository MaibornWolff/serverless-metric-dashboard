source optional-settings.properties

storageConnectionString=$(az storage account show-connection-string --name $storageAccount | cut -d '"' -f4 | sed -n '2p')

az storage container create --name function-releases --public-access off --connection-string $storageConnectionString

fileName=functions_release.zip
version=v0.1.0
curl -L https://github.com/MaibornWolff/serverless-metric-dashboard/releases/download/$version/functions.zip > $fileName

az storage blob upload --connection-string $storageConnectionString --container-name function-releases --name $fileName --file $fileName

releaseURL=az storage blob url --connection-string $storageConnectionString --container-name function-releases --name $fileName | cut -d '"' -f2

az functionapp config appsettings set --resource-group $resourceGroup --name $functionAppName --settings WEBSITE_NODE_DEFAULT_VERSION=$nodeVersion WEBSITE_RUN_FROM_PACKAGE=1 PROMETHEUS_AGGREGATOR_ADDRESS=$prometheusAggregatorAddress PUSHGATEWAY_ADDRESS=$pushgatewayAddress  COSMOSDB_CONNECTION=$cosmosConnectionString WEBSITE_RUN_FROM_ZIP=$releaseURL

rm $fileName

source upload-images-http.sh