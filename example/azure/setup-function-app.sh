source optional-settings.properties

version=v0.1.0

az functionapp config appsettings set --resource-group $resourceGroup --name $functionAppName --settings WEBSITE_NODE_DEFAULT_VERSION=$nodeVersion WEBSITE_RUN_FROM_PACKAGE=1 PROMETHEUS_AGGREGATOR_ADDRESS=$prometheusAggregatorAddress PUSHGATEWAY_ADDRESS=$pushgatewayAddress  COSMOSDB_CONNECTION=$cosmosConnectionString WEBSITE_RUN_FROM_ZIP=https://github.com/MaibornWolff/serverless-metric-dashboard/releases/download/$version/functions.zip

source upload-images-http.sh