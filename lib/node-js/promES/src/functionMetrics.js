const url = require('url');
const tcpSender = require('./network/tcpSender');
const udpSender = require('./network/udpSender');
const ramTracker = require('./util/ramTracker');
const timeUtils = require('./util/timeUtils');
const metricUtils = require('./util/metricUtils');
const labelManager = require('./util/labelManager');

const FUNCTION_INVOCATIONS_TOTAL = 'function_invocations_total';
const FUNCTION_EXECUTION_TIME_TOTAL = 'function_execution_time_total';
const FUNCTION_FINISHED_TOTAL = 'function_finished_total';
const FUNCTION_GIGABYTE_SECONDS_TOTAL = 'function_gigabyte_seconds_total';

var connectionError;

/**
 * Provider independent metrics exporter for Prometheus Aggregator using simple TCP or UDP sockets
 */
class FunctionMetrics {
    /**
     * Currently supporting sending metrics to Prometheus Aggregator
     * @param {*} metadataManager a metadataManager instance for the used provider
     * @param {string} aggregatorUrl the url to send metrics to which should will be aggregated. The required protocol is tcp:// or udp://
     */
    constructor(metadataManager, aggregatorUrl) {
        this.metadataManager = metadataManager;
        if (aggregatorUrl == null || aggregatorUrl == '') {
            this.aggregatorUrl = metadataManager.getAggregatorUrlEnv();
        } else {
            this.aggregatorUrl = aggregatorUrl;
        }
        this.aggregatorUrl = new URL(this.aggregatorUrl);
        if (this.aggregatorUrl.protocol == "tcp:") {
            this.metricSender = new tcpSender(this.aggregatorUrl, this.metadataManager);
        } else if (this.aggregatorUrl.protocol == "udp:") {
            this.metricSender = new udpSender(this.aggregatorUrl, this.metadataManager);
        } else {
            this.metadataManager.log("The protocol " + this.aggregatorUrl.protocol + " is not supported!");
            connectionError = true;
        }

        timeUtils.setStartTime(process.hrtime());
        this.defaultLabels = new labelManager(metadataManager.getDefaultLabels());
    }

    /**
     * Returns the LabelManager for the default labels, which can be modified
     * @returns labelManager instance which can be modified
     */
    getDefaultLabelManager() {
        return this.defaultLabels;
    }

    /**
     * Logs the function start to Prometheus Aggregator by sending a 1 to the function start metric.
     * Opens a tcp/udp socket which remains open until logFunctionEnd() is called.
     * Ram tracking sends an additional GB-seconds metric if you call logFunctionEnd()
     * @param {boolean} isRAMTrackingEnabled enables RAM tracking in the given ramTrackInterval
     * @param {number} ramTrackInterval the interval in ms in which the current RAM usage is tracked. Values below 100 not recommended
     * @param {number} customResourceUsageFactor the optional factor which is multiplied to the final resource usage, default 2.5
     */
    logFunctionStart(isRAMTrackingEnabled, ramTrackInterval, customResourceUsageFactor) {
        this.isRAMTrackingEnabled = isRAMTrackingEnabled;
        try {
            if (isRAMTrackingEnabled) {
                this.ramTracker = new ramTracker(this.metadataManager, ramTrackInterval, customResourceUsageFactor);
            }

            var invocationsTotalMetric = metricUtils.generatePromMetric(FUNCTION_INVOCATIONS_TOTAL, this.defaultLabels.getLabelsKeyValue(), 1);
            this.metadataManager.log('Final metric:' + invocationsTotalMetric);
            if (!connectionError) {
                this.metricSender.sendMetric(invocationsTotalMetric);
            }
        } catch (err) {
            connectionError = err;
            this.metadataManager.log("An error occurred while trying to connect or send to the prometheus aggregator on: " + this.aggregatorUrl.hostname + ":" + this.aggregatorUrl.port);
            this.metadataManager.log("Disabling metrics for this session");
            this.metadataManager.log(err);
        }
    }

    /**
     * Logs the function end to Prometheus Aggregator including the measured function runtime (time passed
     * since creation of this functionMetrics object) and if enabled in logFunctionStart the estimated GB-seconds
     */
    logFunctionEnd() {
        if (connectionError) {
            this.metadataManager.log("Skipping function end metrics because an error occurred at some point during the connection");
            return;
        }
        try {
            if (this.isRAMTrackingEnabled) {
                this.ramTracker.stopRAMTracking();
            }

            var startEndDiffDecimal = timeUtils.getStartEndDiffDecimal();
            this.metadataManager.log('The code execution time was: ' + startEndDiffDecimal + 'ms');
            var executionTimeMetric = metricUtils.generatePromMetric(FUNCTION_EXECUTION_TIME_TOTAL, this.defaultLabels.getLabelsKeyValue(), startEndDiffDecimal);
            this.metadataManager.log(executionTimeMetric);
            if (!connectionError) {
                this.metricSender.sendMetric(executionTimeMetric);
            }

            var finishedMetric = metricUtils.generatePromMetric(FUNCTION_FINISHED_TOTAL, this.defaultLabels.getLabelsKeyValue(), 1);
            this.metadataManager.log(finishedMetric);
            if (!connectionError) {
                this.metricSender.sendMetric(finishedMetric);
            }

            if (this.isRAMTrackingEnabled) {
                var gbSeconds = this.ramTracker.getGigabyteSeconds(startEndDiffDecimal);
                var gbSecondMetric = metricUtils.generatePromMetric(FUNCTION_GIGABYTE_SECONDS_TOTAL, this.defaultLabels.getLabelsKeyValue(), gbSeconds);
                this.metadataManager.log(gbSecondMetric);
                if (!connectionError) {
                    this.metricSender.sendMetric(gbSecondMetric);
                }
            }

            this.metricSender.closeConnection();
        } catch (err) {
            connectionError = err;
            this.metadataManager.log("An error occurred while trying to send to the prometheus aggregator");
            this.metadataManager.log("Disabling metrics for this session");
            this.metadataManager.log(err);
        }
    }

    /**
     * Send a custom counter metric to Prometheus Aggregator (without delay). 
     * The metric is declared automatically in Prometheus Aggregator, no need to add the metric to declaration.json of the
     * Prometheus Aggregator
     * @param {string} metricName the name of the metric in Prometheus style
     * @param {number} metricValue the value of the metric (number)
     * @param {object} additionalLabels (optional) additional labels in typical javascript object label: value format
     * @param {boolean} ignoreDefaultLabels (optional) if true default labels of the metadata manager will be added to additionalLabels
     */
    logCustomMetric(metricName, metricValue, additionalLabels, ignoreDefaultLabels) {
        var labels;
        if (!ignoreDefaultLabels) {
            labels = new labelManager(this.defaultLabels.getLabelsKeyValue());
            if (additionalLabels) {
                labels.merge(additionalLabels);
            }
        } else {
            labels = new labelManager(additionalLabels);
        }
        var metricJSON = {
            name: metricName,
            type: "counter",
            help: "custom metric",
            labels: labels.getLabelsKeyValue(),
            value: metricValue
        }
        var metric = JSON.stringify(metricJSON);
        this.metadataManager.log("Sending custom metric: " + metric);
        this.metricSender.sendMetric(metric);
    }

    /**
     * The time passed since logFunctionStart() in ms rounded to one decimal place
     */
    getExecutionTime() {
        return timeUtils.getStartEndDiffDecimal();
    }
}

module.exports = FunctionMetrics;