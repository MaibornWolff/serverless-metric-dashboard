# NodeJS Prometheus Exporter for Serverless

This package is part of [Serverless Metrics Dashboard (Github)](https://github.com/MaibornWolff/serverless-metric-dashboard). You need a server component to push your metrics to. A guide and an example can be found on the linked [Github page](https://github.com/MaibornWolff/serverless-metric-dashboard).

## promCES
Prometheus Client Exporter for Serverless: Library which can push invocation specific metrics to the Prometheus Pushgateway using the Prometheus Client library (prom-client) for nodeJS. The package [promES](https://www.npmjs.com/package/promes) is required, too. promES is dependency-free and will be sufficient for most use cases. promCES is mostly a showcase at the moment.

The library is currently only implemented for Microsoft Azure Functions. To use other providers, you only need to add a new metadataManager implementation. See [Metadata Manager](#Metadata-Manager) for details.

### Limitations of the official Prometheus Pushgateway

The Prometheus Pushgateway has no aggregating functionality and is not intended to be anything else than a metrics cache ([link](https://github.com/prometheus/pushgateway#non-goals)). It simply caches the typical /metrics page of an application. These metrics will be cached forever unless the Pushgateway is restarted or the metrics are overridden by a job with the same name. If you push metrics to the Pushgateway, for example by using a Prometheus Client implementation, you have to provide a job name. This job name is used for two things: The job name is included as a "job" label and it defines which labels will be overridden at a push. The prom-client library has two options: push() which deletes all metrics with the provided job name and adds the newly pushed labels. pushAdd() only deletes metrics with identical labels and the same metric name. Therefore, if you want to push metrics from a Serverless function to the Pushgateway you have to choose a unique job name. Otherwise simultaneously running functions will override their metrics. A single metric, which tracks the total amount of function invocations, is not possible if you use the Prometheus Pushgateway.

You can also push invocation specific metrics by adding a job label in PromES. Thus the PromCES library is not really necessary but it demonstrates how the prom-client library could be used for example for longer running functions.

### Requirements

- npm packages promES, promCES and prom-client. Make sure that the node_modules folder gets deployed to the cloud (might depend on deployment method and provider)
- Address to the Prometheus Pushgateway as environment variable `"PUSHGATEWAY_ADDRESS"` in url format `http://address:port`. Environment variables for Azure Functions can be set in the Function App (Platform Features -> Application Settings) or via Azure CLI (e.g. `az functionapp config appsettings set ... --settings PUSHGATEWAY_ADDRESS=<address>`). You can also pass the address to the constructor of FunctionMetrics

### Use The Library
An example can be found in the Azure Example [PromClientExample function](example/azure/functions/image-processor-app/PromClientExample/index.js).


### Metadata Manager

- getDefaultLabels() returning a JSON object with labels for Prometheus in key-value format. The labels should enable a clear distinction between the different functions. Because Azure groups functions in Function Apps a function_app label is required. This might not be necessary for your provider. Do **not** include the invocation id here because the invocation id is set separately in the job label used by prom-client.
- getGatewayUrlEnv() to read the address to Prometheus Pushgateway from an environment variable
- a log() function which ideally allows any amount of parameters just like console.log()

## Performance Considerations

The use of the [promES](https://www.npmjs.com/package/promes) library might increase execution time and resource usage of your function. However, the impact of the library in its current form should be minimal if you don't track the RAM-usage of your function. Enabling UDP instead of TCP might also increase the performance of the library.

promCES uses the Pushgateway HTTP-API to push metrics and does not support UDP. Therefore it's likely to be a bit slower.