# NodeJS Prometheus Exporter for Serverless Libraries

- [promES](#promES): no-dependency library to push metrics to [Prometheus Aggregator](https://github.com/peterbourgon/prometheus-aggregator), an aggregating pushgateway.
- [promCES](#promCES): library to push metrics to the official [Prometheus Pushgateway](https://github.com/prometheus/pushgateway) which is a metrics **cache** and **no aggregator**.
- [Performance Considerations](#Performance-Considerations)

## promES
Prometheus Exporter for Serverless

No-dependency package to push metrics to [prometheus-aggregator](https://github.com/peterbourgon/prometheus-aggregator) by Peter Bourgon. The library is currently only implemented for Microsoft Azure Functions. To use other providers, you only need to add a new metadataManager implementation. See [Metadata Manager](#Metadata-Manager) for details.

### Requirements
- Address to the Prometheus Aggregator as environment variable `"PROMETHEUS_AGGREGATOR_ADDRESS"` in url format `tcp://address:port`. TCP can optionally be replaced with upd, if enabled in the Prometheus Aggregator. Environment variables for Azure Functions can be set in the Function App (Platform Features -> Application Settings) or via Azure CLI (e.g. `az functionapp config appsettings set ... --settings PROMETHEUS_AGGREGATOR_ADDRESS=<address>`). You can also pass the address to the constructor of FunctionMetrics
- Install promES via npm and make sure that the node_modules folder gets deployed to the cloud (might depend on deployment method and provider)

### Use The Library
An easy example can be found in the Azure Example [Hello World function](example/azure/functions/image-processor-app/HelloWorld/index.js).

The current implementation supports the following metrics (all metrics are sent immediately):

- logFunctionStart(): Adds +1 to the function_invocations_total metric. In addition you can enable RAM-tracking by setting parameter 1 to true and by setting parameter 2 to a track interval in milliseconds. The library will save the RAM usage at the given interval. The RAM usage is multiplied with the execution time to estimate the used GB-seconds. RAM tracking is terminated after logFunctionEnd() was called
- logFunctionEnd() sends +1 to the function_finished_total metric and the execution time in milliseconds to function_execution_time_total. It also sends the estimated GB-seconds if RAM tracking was enabled in logFunctionStart()
- logCustomMetric() allows you to send a custom metric to the Prometheus Aggregator. The first two parameters, metric name and metric value, are required

### Metadata Manager

You can use the azureMetadataManager as an example. Required methods are:
- getDefaultLabels() returning a JSON object with labels for Prometheus in key-value format. Prometheus Aggregator sums the values of a metric if the label values of a metric are identical. The default labels are used for basic logFunctionStart/End metrics and can be optionally used for custom metrics. The labels should enable a clear distinction between the different functions. Because Azure groups functions in Function Apps a function_app label is required. This might not be necessary for your provider.
- getInvocationId() should exist in case you want to send metrics which should not be aggregated. The invocation ID should be a unique identifier for the current execution of the Function. This method is required for PromCES.
- getAggregatorUrlEnv() to read the address to Prometheus Aggregator from an environment variable. (getGatewayUrlEnv is only necessary for promCES)
- a log() function which ideally allows any amount of parameters just like console.log()

Feel free to create a Pull Request with your implementation!

## promCES
Prometheus Client Exporter for Serverless: Library which can push invocation specific metrics to the Prometheus Pushgateway using the Prometheus Client library (prom-client) for nodeJS.

The library is currently only implemented for Microsoft Azure Functions. To use other providers, you only need to add a new metadataManager implementation. See [Metadata Manager Part 2](#Metadata-Manager-part-2) for details.

### Limitations of the official Prometheus Pushgateway

The Prometheus Pushgateway has no aggregating functionality and is not intended to be anything else than a metrics cache ([link](https://github.com/prometheus/pushgateway#non-goals)). It simply caches the typical /metrics page of an application. These metrics will be cached for ever unless the Pushgateway is restarted or the metrics are overridden by a job with the same name. If you push metrics to the Pushgateway, for example by using a Prometheus Client implementation, you have to provide a job name. This job name is used for two things: The job name is included as a "job" label and it defines which labels will be overridden at a push. The prom-client library has two options: push() which deletes all metrics with the provided job name and adds the newly pushed labels. pushAdd() only deletes metrics with identical labels and the same metric name. Therefore, if you want to push metrics from a Serverless function to the Pushgateway you have to choose a unique job name. Otherwise simultaneously running functions will override their metrics. A single metric, which tracks the total amount of function invocations, is not possible if you use the Prometheus Pushgateway.

You can also push invocation specific metrics by adding a job label in PromES. Thus the PromCES library is not really necessary but it demonstrates how the prom-client library could be used for example for longer running functions.

### Requirements

- npm packages promES, promCES and prom-client. Make sure that the node_modules folder gets deployed to the cloud (might depend on deployment method and provider)
- Address to the Prometheus Aggregator as environment variable `"PUSHGATEWAY_ADDRESS"` in url format `http://address:port`. Environment variables for Azure Functions can be set in the Function App (Platform Features -> Application Settings) or via Azure CLI (e.g. `az functionapp config appsettings set ... --settings PUSHGATEWAY_ADDRESS=<address>`). You can also pass the address to the constructor of FunctionMetrics

### Use The Library
An example can be found in the Azure Example [PromClientExample function](example/azure/functions/image-processor-app/PromClientExample/index.js).


### Metadata Manager Part 2

- getDefaultLabels() returning a JSON object with labels for Prometheus in key-value format. Prometheus Aggregator sums the values of a metric if the label values of a metric are identical. The default labels are used for basic logFunctionStart/End metrics and can be optionally used for custom metrics. The labels should enable a clear distinction between the different functions. Because Azure groups functions in Function Apps a function_app label is required. This might not be necessary for your provider. Do **not** include the invocation id here because the invocation id is set separately in the job label used by prom-client.
- getGatewayUrlEnv() to read the address to Prometheus Pushgateway from an environment variable
- a log() function which ideally allows any amount of parameters just like console.log()

## Performance Considerations

The use of the promES library might increase execution time and resource usage of your function. However, the impact of the library in its current form should be minimal if you don't track the RAM-usage of your function. Enabling UDP instead of TCP might also increase the performance of the library.

promCES uses the Pushgateway HTTP-API to push metrics and does not support UDP. Therefore it's likely to be a bit slower.