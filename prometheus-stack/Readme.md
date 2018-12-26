## Run the stack
Run `docker-compose up` to build and execute the Prometheus stack

## Grafana

Open Grafana: In the browser type `<address>:3000` (localhost if you run the stack locally) and login to Grafana with username 'admin' and password 'foobar' unless changed in prometheus-stack/grafana/config.monitoring. First go to settings and add the data source Prometheus with the address `http://prometheus:9090`. Set the scrape interval to 5s. Save the data source. To add a dashboard, mouseover the plus sign on the left side and select 'Import' and paste the content of prometheus-stack/grafana/dashboards.json.

All legends have the structure functionapp:functionname because a function *helloWorld* could exist in the Function App *Test* and *HelloApp*. If every function has a unique name the functionapp can be removed from the graph legend format

## Prometheus Aggregator

### UDP Support

1. Change `-socket=tcp://0.0.0.0:8191` to `-socket=udp://0.0.0.0:8191` in the Dockerfile
2. Replace `- 8191:8191` with `- 8191:8191/udp` in docker-compose.yml otherwise Docker will reject UDP packages
3. Check that the VM you are using does not deny UDP packages on port 8191 (should be correctly configured if you deployed the VM using the scripts in example/azure)
4. Don't forget to change the Prometheus Aggregator address in deployment-settings.properties (simply replace tcp with udp)

Why is tcp enabled instead of udp per default? Tcp is easier for experimenting as you will get an error message if the connection could not be established