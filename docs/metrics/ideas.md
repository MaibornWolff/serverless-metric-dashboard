# Metric & Extractable Information - Ideas
## Types of Information

For this work I identified three types of extractable information:

1. Aggregated metrics. These metrics can be observed by Prometheus over time and allow the usage of Prometheus' PromQL features. These metrics are aggregated (summed) by function name
2. Invocation specific metrics (without aggregation)
3. Application specific information and runtime environment metadata on invocation level. This can be anything not included in 1. and 2. E.g.: Function metadata, logs, etc. Type 3 can't be processed by Prometheus but can be passed to a metric as a label

# Metrics

## Ideas
### Aggregated Metrics (per function)
Basic operations can be applied in Prometheus for example average, rate etc.
- Total invocations
- Total execution time
- Total "section" execution time
- Total RAM/GB-seconds usage
- Total errors (possibly aggregated by error type)
- Total request time (e.g. outbound http requests)
- Total amount of requests
- (CPU usage, might require average aggregation in aggregation gateway which is currently not supported)
- Application specific metrics, for example processed objects (a function might be able to process several objects at once)
- Amount of functions running on the same server or worker (e.g. should be possible for Node). This is a Gauge that needs to be aggregated but current Gauge implementations do not support aggregated Gauges properly
- Number of functions running at the same time (scaling)
- Request origin (for example which url called the function) -> sum that up
- Indirect metrics: Cost estimation using metrics like invocation, RAM Usage, execution time

### Unique invocation metrics
Prometheus: To prevent that metrics can be overwritten in the Pushgateway it is necessary to include a unique label value for each invocated function (for example the invocation id provided by the cloud provider). These metrics will be exposed to Prometheus for ever although they can't be changed after the function finished. Prometheus will continue to scrape these metrics (although they will never provide any useful information anymore). Deleting metrics could be achieved by restarting the Pushgateway. This approach can get problematic at very large scale because Prometheus has to scrape many different metrics

- Logging start & end
- Execution time
- Used GB-seconds during execution
- RAM-usage
- Request metrics (for example http requests)
- Error/failure metrics
- CPU usage

# Logging

### Application specific information and runtime environment metadata

This information might be passed on to a Prometheus metric using labels. This however introduces new dimensions which should be avoided if not necessary

- General logs, error logs etc.
- Logging processed objects to enable tracing
- Logging web requests, database transactions
- Logging information about the trigger (if possible)
- Hardware information if available. Obviously only useful if functions can run on different hardware
- Software information related to the function host, for example used version (Node version for example)
- Cold start metrics for node: Check if a global library variable exists. If no -> First execution on newly created environment; if yes -> a function already ran on this server, no coldstart. However, there might be no way to measure the cold start time
- Information if function is running on a cloud server or is invoked on a local test enviroment