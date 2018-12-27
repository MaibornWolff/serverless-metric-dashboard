const metricUtils = require('./metricUtils');

/**
 * Handles an object with label_name: label_value key-value pairs. Provides methods to modify labels
 * and return them in required formats
 */
class LabelManager {
    /**
     * New LabelManager instance with empty label list or with the labels given in labelsKV
     * @param {object} labelsKV object with labels in key-value format
     */
    constructor(labelsKV) {
        if (labelsKV) {
            this.labelsKV = JSON.parse(JSON.stringify(labelsKV));
        } else {
            this.labelsKV = {}
        }
    }

    /**
     * Merges labelsKV into the saved label list. Labels which did not exist yet get added and existing ones updated
     * @param {*} labelsKV object with labels in key-value format
     */
    merge(labelsKV) {
        Object.assign(this.labelsKV, labelsKV);
        return this.labelsKV;
    }

    /**
     * Returns all labels in key-value format
     */
    getLabelsKeyValue() {
        return this.labelsKV;
    }

    /**
     * Set new labels and overwrite old ones
     * @param {*} labels object with labels in key-value format
     */
    setLabelsKeyValue(labels) {
        this.labelsKV = JSON.parse(JSON.stringify(labels));
    }

    /**
     * Set the value of one specific label
     * @param {string} labelName name of the label to be modified
     * @param {*} labelValue value of the label with labelName
     */
    setLabel(labelName, labelValue) {
        this.labelsKV[labelName] = labelValue;
    }

    /**
     * Remove the label with the given name
     * @param {string} labelName the name of the label to delete
     */
    removeLabel(labelName) {
        delete this.labelsKV[labelName];
    }

    /**
     * Returns an array containing all label names without values
     * For example: ["function_name", "invocation_id", "function_app"]
     */
    getLabelList() {
        var labelList = [];
        for(var labelName in this.labelsKV) {
            labelList.push(labelName);
        }
        return labelList;
    }

    /**
     * Returns all key-value pairs in Prometheus format:
     * E.g.: {environment="azure-cloud",function_app="hello-world",function_name="HelloWorld",
     * instance="prometheus-aggregator:8192",job="prometheus-aggregator"}
     */
    getPromLabelString() {
        return metricUtils.generatePromLabels(this.labelsKV);
    }
}

module.exports = LabelManager;