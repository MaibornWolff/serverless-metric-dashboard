source optional-settings.properties

echo "Proceeding will delete all azure resources contained in the resource group $resourceGroup. THIS ACTION CAN'T BE UNDONE!"
echo "This action might take several minutes depending on the resources in your resource group."
az group delete --name $resourceGroup