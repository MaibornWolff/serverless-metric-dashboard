/**
 * MetadataManager for Azure Functions. Provides typical information like function name, invocation id and environment variables
 * values for the pushgateway addresses
 */
class AzureMetadataManager {
    constructor(context) {
        this.context = context;
    }

    /**
     * Returns the standard set of labels for Azure Function Environments which are:
     * 
     * The function name obtained from the context object
     * 
     * The Function App name obtained from the WEBSITE_SITE_NAME environment variable
     * 
     * The environment label. For this label you have to set the environment variable METRICS_ENVIRONMENT.
     * If not set it defaults to azure-cloud. It can make sense to override this value if you want to
     * differentiate metrics obtained from local testing and running the function in the cloud.
     * 
     */
    getDefaultLabels() {
        var defaultLabels = {
            function_name: this.getFunctionName(),
            function_app: this.getFunctionContainerName(),
            environment: this.getEnvironmentName()
        }
        return defaultLabels;
    }

    /**
     * Returns the name of the function (not the function app).
     * The function name is usually given by the folder name containing the function.
     */
    getFunctionName() {
        return this.context.executionContext.functionName;
    }

    /**
     * The Azure "Function App" is a container for several functions which share the same libraries
     * and settings. The name of the function app is unique and therefore a function can be uniquely
     * identified by <function-app-name>:<function-name>. If the function app name (here: container name)
     * is not set as a label the Prometheus aggregator will aggregate metrics of functions which might
     * be in completely different function apps but have the same name
     */
    getFunctionContainerName() {
        return process.env['WEBSITE_SITE_NAME'];
    }

    /**
     * The unique inovcation id passed in the context object of an Azure Function
     */
    getInvocationId() {
        return this.context.executionContext.invocationId;
    }

    /**
     * Returns the value contained in the PUSHGATEWAY_ADDRESS environment variable which should contain the
     * address of the Prometheus Pushgateway
     */
    getGatewayUrlEnv() {
        return process.env['PUSHGATEWAY_ADDRESS'];
    }

    /**
     * Returns the value contained in the PROMETHEUS_AGGREGATOR_ADDRESS environment variable which should contain the
     * address of the Prometheus Aggregator
     */
    getAggregatorUrlEnv() {
        return process.env['PROMETHEUS_AGGREGATOR_ADDRESS'];
    }

    /**
     * Returns the value of the METRICS_ENVIRONMENT environment variable.
     * This variable can be used to distinguish local testing executions from executions in the Azure cloud.
     * If the environment variable is not set, "azure-cloud" will be returned as default
     */
    getEnvironmentName() {
        if (process.env['METRICS_ENVIRONMENT']) {
            return process.env['METRICS_ENVIRONMENT'];
        } else {
            return "azure-cloud"
        }
    }

    /**
     * Logs a new line to the context.log() function provided by Azure
     */
    log() {
        this.context.log.apply(null, arguments);
    }
}

module.exports = AzureMetadataManager;