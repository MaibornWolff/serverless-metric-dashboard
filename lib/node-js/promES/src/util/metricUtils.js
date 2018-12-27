module.exports = {

    /**
     * Generates a metric string in the typical Prometheus format which can be consumed by the Prometheus
     * Aggregator. If the metric is invalid the metric will simply be ignored by the Prometheus Aggregator
     * @param {string} metricName the metric name (for example function_invocations_total)
     * @param {*} labels the labels which will be attached to the metrics. The input should have the format label_name: label_value
     * @param {number} value the value of the metric, for example 1 or 3.14159265
     */
    generatePromMetric(metricName, labels, value) {
        var metric = metricName + this.generatePromLabels(labels);
        metric += ' '
        metric += value;
        return metric;
    },

    /**
     * Generates the typical Prometheus label string for the given labels (key-value format) like that: 
     * {environment="azure-cloud",function_app="hello-world",function_name="HelloWorld",instance="prometheus-aggregator:8192",job="prometheus-aggregator"}
     * @param {*} labels 
     */
    generatePromLabels(labels) {
        var labelString = '{';
        var first = true;
        for (var label in labels) {
            if (first) {
                first = false;
            } else {
                labelString += ",";
            }
            labelString += label + '="' + labels[label] + '"';
        }
        labelString += '}';
        return labelString;
    }
}