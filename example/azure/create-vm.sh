source optional-settings.properties

set -ex

ssh-keygen -t rsa -b 2048 -f vm-key -N ""
az group create --name $vmResourceGroup --location $location
az vm create --name $vmName --resource-group $vmResourceGroup --location $location --image Canonical:UbuntuServer:18.04-LTS:latest --size Standard_B1s --authentication-type ssh \
--ssh-key-value vm-key.pub --admin-username $vmAccountName --storage-sku Standard_LRS --custom-data cloud-init.yml --public-ip-address-dns-name $vmDnsName
az vm open-port --port 9090 --name $vmName --resource-group $vmResourceGroup --priority 310
az vm open-port --port 9091 --name $vmName --resource-group $vmResourceGroup --priority 320
az vm open-port --port 8191 --name $vmName --resource-group $vmResourceGroup --priority 330
az vm open-port --port 3000 --name $vmName --resource-group $vmResourceGroup --priority 340
sleep 120
scp -r -i vm-key ../../prometheus-stack $vmAccountName@$vmAddress:/home/$vmAccountName/prometheus-stack
ssh -i vm-key $vmAccountName@$vmAddress "sudo docker-compose -f prometheus-stack/docker-compose.yml up -d"
echo "Check that the Virtual Machine and Prometheus are working by opening $vmAddress:9090 in you web browser"
echo "The Prometheus docker container can take a couple of minutes to become ready"
echo "You can log into the virtual machine at any time by using: ssh -i vm-key $vmAccountName@$vmAddress"
