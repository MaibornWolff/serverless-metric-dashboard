source optional-settings.properties
cd functions/image-processor-app
# This command zips the function app folder (files/folders can be excluded in .funcignore) and uploads it to azure storage. It then tells the function app to use the uploaded zip. Because the app is not being unzipped
# in the cloud (with WEBSITE_RUN_FROM_PACKAGE=1) you don't have to worry about Azure executing old or wrong code. Note that the deployment shows as failed if the function app is disabled in the cloud
# Please don't exclude the bin, node_modules and obj folders as they are not installed by default in the Azure Function App environment
# npm install
func extensions install
func azure functionapp publish $functionAppName