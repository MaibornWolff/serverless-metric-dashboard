# NodeJS Prometheus Exporter for Serverless

This package is part of [Serverless Metrics Dashboard (Github)](https://github.com/MaibornWolff/serverless-metric-dashboard). You need a server component to push your metrics to. A guide and an example can be found on the linked [Github page](https://github.com/MaibornWolff/serverless-metric-dashboard).

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