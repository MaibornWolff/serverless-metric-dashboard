const client = require('prom-client');
const basicFunctionMetrics = require('serverless-observer');

const FUNCTION_INVOCATION = 'function_invocation';
const FUNCTION_EXECUTION_TIME = 'function_execution_time';

class FunctionMetrics {
    constructor(metadataManager, aggregatorUrl, gatewayUrl) {
        this.metadataManager = metadataManager;
        this.noDepFunctionMetrics = new basicFunctionMetrics.FunctionMetrics(new basicFunctionMetrics.AzureMetadataManager(context), aggregatorUrl);
        if (gatewayUrl == null || gatewayUrl == '') {
            this.gatewayUrl = metadataManager.getGatewayUrlEnv();
        } else {
            this.gatewayUrl = gatewayUrl;
        }

        this.registry = new client.Registry();
        this.gateway = new client.Pushgateway(this.gatewayUrl, {}, this.registry);
        this.totalPushes = 0;
    }

    /**
     * Calls the logFunctionStart method of the no dependency serverless-observer package
     */
    logFunctionStart(isRAMTrackingEnabled, ramTrackInterval, customResourceUsageFactor) {
        this.noDepFunctionMetrics.logFunctionStart(isRAMTrackingEnabled, ramTrackInterval, customResourceUsageFactor);
    }

    /**
     * TODO allow more labels
     * Logs the function start to Prometheus using the unique invocation id and original Prometheus
     *  Pushgateway
     */
    logFunctionStartPrometheus() {
        const functionStartCounter = new client.Counter({
            name: FUNCTION_INVOCATION,
            help: 'Has value 1 for every function invocation',
            labelNames: ['function_name'],
            registers: [this.registry]
        });
        functionStartCounter.inc(this.defaultLabels, 1);
        this.pushMetrics();
    }

    logCustomMetric(metricName, metricValue, additionalLabels, ignoreDefaultLabels) {
        this.noDepFunctionMetrics.logCustomMetric(metricName, metricValue, additionalLabels, ignoreDefaultLabels);
    }

    /**
     * Calls the logFunctionEnd method of the no dependency serverless-observer package
     */
    logFunctionEnd() {
        this.noDepFunctionMetrics.logFunctionEnd();
    }

    /**
     * TODO allow more labels
     * Logs the function end to Prometheus using the unique invocation id and original Prometheus
     *  Pushgateway
     */
    logFunctionEndPrometheus() {
        const functionExecutionTimeGauge = new client.Gauge({
            name: FUNCTION_EXECUTION_TIME,
            help: 'Function execution time in milliseconds',
            labelNames: ['function_name'],
            registers: [this.registry]
        });
        var startEndDiffDecimal = this.noDepFunctionMetrics.getExecutionTime();
        this.metadataManager.log('The code execution time was: ' + startEndDiffDecimal + 'ms');

        functionExecutionTimeGauge.set(this.defaultLabels, startEndDiffDecimal);
        this.pushMetrics();
    }

    /**
     * Pushes the currently registried metrics of this function invocation to the Prometheus
     * Pushgateway. This function is automatically called when using logFunctionStartPrometheus
     *  or logFunctionEndPrometheus
     */
    pushMetrics() {
        var pushStartTime = process.hrtime();
        var pushNumber = this.totalPushes++;
        this.gateway.pushAdd({ jobName: this.invocationId }, (err, resp, body) => {
            var pushDifference = process.hrtime(pushStartTime);
            this.metadataManager.log('PushAdd callback reached for push number ' + pushNumber + '. Push time in ms: ' + this.noDepFunctionMetrics.convertHrTimeToMilliseconds(pushDifference));
            if (err) {
                this.metadataManager.log('Error: ', err);
                if (resp) {
                    this.metadataManager.log('Response: ', resp);
                }
                if (body) {
                    this.metadataManager.log('Body: ', body);
                }
            }
        });
    }
}

module.exports = FunctionMetrics;