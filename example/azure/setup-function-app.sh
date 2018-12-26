source optional-settings.properties

az functionapp config appsettings set --resource-group $resourceGroup --name $functionAppName --settings WEBSITE_NODE_DEFAULT_VERSION=$nodeVersion WEBSITE_RUN_FROM_PACKAGE=1 PROMETHEUS_AGGREGATOR_ADDRESS=$prometheusAggregatorAddress PUSHGATEWAY_ADDRESS=$pushgatewayAddress  COSMOSDB_CONNECTION=$cosmosConnectionString

cd functions/image-processor-app
npm install

func extensions install

source upload-images-http.sh