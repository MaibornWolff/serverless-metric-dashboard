const assert = require('assert');
var labelManager = require('../src/util/labelManager');

describe('labelManager', function () {
    describe('#constructor()', function () {
        var labels = {
            test_label: "test",
            label123: 234,
            test_two: "string",
            test_three: "three",
            finished: "finish"
        };
        it('No parameters', function () {
            var inst = new labelManager();
            assert.deepEqual(inst.getLabelsKeyValue(), {});
        });
        it('Empty object parameter', function () {
            var inst = new labelManager({});
            assert.deepEqual(inst.getLabelsKeyValue(), {});
        });
        it('One label', function () {
            var inst = new labelManager({label_123: "test"});
            assert.deepEqual(inst.getLabelsKeyValue(), {label_123: "test"});
        });
        it('Five labels', function () {
            var inst = new labelManager(labels);
            assert.deepEqual(inst.getLabelsKeyValue(), labels);
        });
    });

    describe('#setLabelsKeyValue()', function () {
        var labels = {
            test_label: "test",
            label123: 234,
            test_two: "string",
            test_three: "three",
            finished: "finish"
        };
        it('Five labels without constructor parameter', function () {
            var inst = new labelManager();
            inst.setLabelsKeyValue(labels);
            assert.deepEqual(inst.getLabelsKeyValue(), labels);
        });
        it('Five labels with constructor parameter', function () {
            var inst = new labelManager({test123: "test", test2: "test2"});
            inst.setLabelsKeyValue(labels);
            assert.deepEqual(inst.getLabelsKeyValue(), labels);
        });
    });

    describe('#merge()', function () {
        var labels1 = {
            test_label: "test",
            label123: 234
        }
        var labels12 = {
            label123: 456,
            newLabel: "New"
        }
        var labels12_result = {
            test_label: "test",
            label123: 456,
            newLabel: "New"
        }
        var labels2 = {
            test_two: "string",
            test_three: "three",
            finished: "finish"
        }
        var labels_result = {
            test_label: "test",
            label123: 234,
            test_two: "string",
            test_three: "three",
            finished: "finish"
        };
        it('Merge with empty labels', function () {
            var inst = new labelManager();
            inst.merge(labels1);
            assert.deepEqual(inst.getLabelsKeyValue(), labels1);
        });
        it('Merge with self', function () {
            var inst = new labelManager(labels1);
            inst.merge(labels1);
            assert.deepEqual(inst.getLabelsKeyValue(), labels1);
        });
        it('Merge with empty', function () {
            var inst = new labelManager(labels1);
            inst.merge({});
            assert.deepEqual(inst.getLabelsKeyValue(), labels1);
        });
        it('Merge two distinct labels', function () {
            var inst = new labelManager(labels1);
            inst.merge(labels2);
            assert.deepEqual(inst.getLabelsKeyValue(), labels_result);
        });
        it('Merge two overlapping labels', function () {
            var inst = new labelManager(labels1);
            inst.merge(labels12);
            assert.deepEqual(inst.getLabelsKeyValue(), labels12_result);
        });
    });
    
    describe('#setLabel()', function () {
        var labels1 = {
            test_label: "test",
            label123: 234
        }
        it('Add label to empty labels', function () {
            var inst = new labelManager();
            inst.setLabel("test_label", "test_value");
            assert.deepEqual(inst.getLabelsKeyValue(), {test_label: "test_value"});
        });
        it('Add label to labels without that new label', function () {
            var inst = new labelManager(labels1);
            inst.setLabel("hello", "world");
            assert.deepEqual(inst.getLabelsKeyValue(), {test_label: "test", label123: 234, hello: "world"});
        });
        it('Add label to labels to overwrite existing value', function () {
            var inst = new labelManager(labels1);
            inst.setLabel("test_label", "test_value");
            assert.deepEqual(inst.getLabelsKeyValue(), {test_label: "test_value", label123: 234});
        });
    });

    describe('#removeLabel()', function () {
        var labels1 = {
            test_label: "test",
            label123: 234
        }
        it('Remove existing value out of 2', function () {
            var inst = new labelManager(labels1);
            inst.removeLabel("test_label");
            assert.deepEqual(inst.getLabelsKeyValue(), {label123: 234});
        });
        it('Remove non existing value out of 2', function () {
            var inst = new labelManager(labels1);
            inst.removeLabel("not_existing");
            assert.deepEqual(inst.getLabelsKeyValue(), labels1);
        });
        it('Remove last value', function () {
            var inst = new labelManager({label: "value"});
            inst.removeLabel("label");
            assert.deepEqual(inst.getLabelsKeyValue(), {});
        });
        it('Remove value from empty labels', function () {
            var inst = new labelManager();
            inst.removeLabel("label");
            assert.deepEqual(inst.getLabelsKeyValue(), {});
        });
    });

    describe('#getLabelList()', function () {
        var labels5 = {
            test_label: "test",
            label123: 234,
            test_two: "string",
            test_three: "three",
            finished: "finish"
        };
        it('Empty List', function () {
            var inst = new labelManager();
            assert.deepEqual(inst.getLabelList(), []);
        });
        it('List with 1 element', function () {
            var inst = new labelManager({label: "Value"});
            assert.deepEqual(inst.getLabelList(), ['label']);
        });
        it('List with 5 elements', function () {
            var inst = new labelManager(labels5);
            assert.deepEqual(inst.getLabelList(), ['test_label', "label123", "test_two", "test_three", "finished"]);
        });
    });

    describe('#getPromLabelString()', function () {
        // skipped because equivalent to generatePromLabels in metricUtils
    });

    
});