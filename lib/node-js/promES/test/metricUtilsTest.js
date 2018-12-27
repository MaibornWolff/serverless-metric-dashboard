const assert = require('assert');
var metricUtils = require('../src/util/metricUtils');

describe('metricUtils', function () {
    describe('#generatePromLabels()', function () {
        it('Empty labels, should return "{}"', function () {
            var labels = {};
            assert.deepEqual(metricUtils.generatePromLabels(labels), '{}');
        });
        it('One label', function () {
            var labels = {
                test_label: "test"
            };
            assert.deepEqual(metricUtils.generatePromLabels(labels), '{test_label="test"}');
        });
        it('Two labels', function () {
            var labels = {
                test_label: "test",
                label123: "234"
            };
            assert.deepEqual(metricUtils.generatePromLabels(labels), '{test_label="test",label123="234"}');
        });
        it('Two labels with number', function () {
            var labels = {
                test_label: "test",
                label123: 234
            };
            assert.deepEqual(metricUtils.generatePromLabels(labels), '{test_label="test",label123="234"}');
        });
        it('Two labels with undefined, should convert undefined to string and not crash', function () {
            var labels = {
                test_label: "test",
                label123: undefined
            };
            assert.deepEqual(metricUtils.generatePromLabels(labels), '{test_label="test",label123="undefined"}');
        });
        it('Five labels with number', function () {
            var labels = {
                test_label: "test",
                label123: 234,
                test_two: "string",
                test_three: "three",
                finished: "finish"
            };
            assert.deepEqual(metricUtils.generatePromLabels(labels), '{test_label="test",label123="234",test_two="string",test_three="three",finished="finish"}');
        });
    });
    describe('#generatePromMetric()', function() {
        it('Empty labels, value 0.5', function () {
            var labels = {};
            assert.deepEqual(metricUtils.generatePromMetric("test_metric", labels, 0.5), 'test_metric{} 0.5');
        });
        it('Empty labels, value 1.0', function () {
            var labels = {};
            assert.deepEqual(metricUtils.generatePromMetric("test_metric", labels, 1.0), 'test_metric{} 1');
        });
        it('One label, value 10.5', function () {
            var labels = {
                test_label: "test"
            };
            assert.deepEqual(metricUtils.generatePromMetric("test_metric", labels, 10.5), 'test_metric{test_label="test"} 10.5');
        });
        it('Five labels, value 100.5', function () {
            var labels = {
                test_label: "test",
                label123: 234,
                test_two: "string",
                test_three: "three",
                finished: "finish"
            };
            assert.deepEqual(metricUtils.generatePromMetric("test_metric", labels, 100.5), 'test_metric{test_label="test",label123="234",test_two="string",test_three="three",finished="finish"} 100.5');
        });
    });
});