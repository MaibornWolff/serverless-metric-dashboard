const client = require('prom-client');
const promes = require('promes');

const FUNCTION_INVOCATION = 'function_invocation';
const FUNCTION_EXECUTION_TIME = 'function_execution_time';

var customMetricsList = {};

class FunctionMetrics {
    constructor(metadataManager, gatewayUrl) {
        this.metadataManager = metadataManager;
        if (gatewayUrl == null || gatewayUrl == '') {
            this.gatewayUrl = metadataManager.getGatewayUrlEnv();
        } else {
            this.gatewayUrl = gatewayUrl;
        }

        this.timeUtils = promes.TimeUtils;
        this.registry = new client.Registry();
        this.gateway = new client.Pushgateway(this.gatewayUrl, {}, this.registry);
        this.totalPushes = 0;

        this.defaultLabels = {};
        // Add default labels from metadataManager to this.defaultLabels
        this.defaultLabels = new promes.LabelManager(metadataManager.getDefaultLabels());
    }

    /**
     * Logs the function start to Prometheus using the unique invocation id and original Prometheus
     *  Pushgateway
     */
    logFunctionStart() {
        const functionStartCounter = new client.Counter({
            name: FUNCTION_INVOCATION,
            help: 'Has value 1 for every function invocation',
            labelNames: this.defaultLabels.getLabelList(),
            registers: [this.registry]
        });
        functionStartCounter.inc(this.defaultLabels.getLabelsKeyValue(), 1);
        this.pushMetrics();
    }

    /**
     * Logs the function end to Prometheus using the unique invocation id and original Prometheus
     *  Pushgateway
     */
    logFunctionEnd() {
        const functionExecutionTimeGauge = new client.Gauge({
            name: FUNCTION_EXECUTION_TIME,
            help: 'Function execution time in milliseconds',
            labelNames: this.defaultLabels.getLabelList(),
            registers: [this.registry]
        });
        var startEndDiffDecimal = this.timeUtils.getStartEndDiffDecimal();
        this.metadataManager.log('The code execution time was: ' + startEndDiffDecimal + 'ms');

        functionExecutionTimeGauge.set(this.defaultLabels.getLabelsKeyValue(), startEndDiffDecimal);
        this.pushMetrics();
    }

    /**
     * Add a custom metric which is not directly sent unless pushMetrics() or logFunctionEnd() is called
     * @param {string} metricName the name of the metric in Prometheus style
     * @param {number} metricValue the value of the metric, gets added in case of a counter
     * @param {string} metricType the type of the metric, either Gauge or Counter
     * @param {object} additionalLabels additional labels in typical javascript object label: value format
     * @param {boolean} ignoreDefaultLabels if true default labels of the metadata manager will be added to additionalLabels
     */
    addCustomMetric(metricName, metricValue, metricType, additionalLabels, ignoreDefaultLabels) {
        var labels;
        if (!ignoreDefaultLabels) {
            labels = new promes.LabelManager(this.defaultLabels.getLabelsKeyValue());
            if (additionalLabels) {
                labels.merge(additionalLabels);
            }
        } else {
            labels = new promes.LabelManager(additionalLabels);
        }

        var metric = customMetricsList[metricName];
        if (!metric) {
            if (metricType == 'counter' || metricType == "Counter") {
                metric = new client.Counter({
                    name: metricName,
                    help: 'Custom metric',
                    labelNames: labels.getLabelList(),
                    registers: [this.registry]
                });
            } else if (metricType == 'gauge' || metricType == "Gauge") {
                metric = new client.Gauge({
                    name: metricName,
                    help: 'Custom metric',
                    labelNames: labels.getLabelList(),
                    registers: [this.registry]
                });
            } else {
                this.metadataManager.log("Metric type: " + metricType + " is invalid!");
                return;
            }
            customMetricsList[metricName] = metric;
        }
        if (metricType == 'counter' || metricType == "Counter") {
            metric.inc(labels.getLabelsKeyValue(), metricValue);
        } else if (metricType == 'gauge' || metricType == "Gauge") {
            metric.set(labels.getLabelsKeyValue(), metricValue);
        }
    }

    /**
     * Pushes the currently registried metrics of this function invocation to the Prometheus
     * Pushgateway. This function is automatically called when using logFunctionStartPrometheus
     *  or logFunctionEndPrometheus
     */
    pushMetrics() {
        var pushStartTime = process.hrtime();
        var pushNumber = this.totalPushes++;
        this.gateway.pushAdd({ jobName: this.metadataManager.getInvocationId() }, (err, resp, body) => {
            var pushDifference = this.timeUtils.getStartEndDiffDecimal(pushStartTime);
            this.metadataManager.log('PushAdd callback reached for push number ' + pushNumber + '. Push time in ms: ' + pushDifference);
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