source optional-settings.properties

storageConnectionString=$(az storage account show-connection-string --name $storageAccount | cut -d '"' -f4 | sed -n '2p')

for entry in "../images"/*
do
  echo "$entry"
  az storage blob upload --connection-string $storageConnectionString --container-name images-unprocessed-http --name $(basename "$entry") --file $entry
done