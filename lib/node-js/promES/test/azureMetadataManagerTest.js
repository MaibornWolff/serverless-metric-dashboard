const assert = require('assert');
var azureMetadataManager = require('../src/metadataManager/azureMetadataManager');
const sinon = require('sinon');

describe('azureMetadataManager', function () {
    process.env['WEBSITE_SITE_NAME'] = "functionapp123";
    process.env['PUSHGATEWAY_ADDRESS'] = "localhost:12345";
    process.env['PROMETHEUS_AGGREGATOR_ADDRESS'] = "localhost:54321";

    var context = {
        executionContext: {
            invocationId: "invocation-id",
            functionName: "function123"
        }
    };
    context.log = sinon.spy();
    var manager = new azureMetadataManager(context);
    var expectedLabels = {
        function_name: "function123",
        function_app: "functionapp123",
        environment: "azure-cloud"
    }
    describe('#getDefaultLabels()', function () {
        it('should return ' + JSON.stringify(expectedLabels), function () {
            assert.deepEqual(manager.getDefaultLabels(), expectedLabels);
        });
    });
    describe('#getEnvironmentName()', function () {
        it('should return "azure-cloud"', function () {
            assert.strictEqual(manager.getEnvironmentName(), "azure-cloud");
        });
    });
    describe('#getFunctionName()', function () {
        it('should return "function123"', function () {
            assert.strictEqual(manager.getFunctionName(), "function123");
        });
    });
    describe('#getFunctionContainerName()', function () {
        it('should return "functionapp123"', function () {
            assert.strictEqual(manager.getFunctionContainerName(), "functionapp123");
        });
    });
    describe('#getInvocationId()', function () {
        it('should return "invocation-id"', function () {
            assert.strictEqual(manager.getInvocationId(), "invocation-id");
        });
    });
    describe('#getGatewayUrlEnv()', function () {
        it('should return "localhost:12345"', function () {
            assert.strictEqual(manager.getGatewayUrlEnv(), "localhost:12345");
        });
    });
    describe('#getAggregatorUrlEnv()', function () {
        it('should return "localhost:54321"', function () {
            assert.strictEqual(manager.getAggregatorUrlEnv(), "localhost:54321");
        });
    });
    describe('#log()', function () {
        it('should call context.log() function correctly with all arguments', function () {
            manager.log("test123", "test2", 1234);
            assert.deepEqual(context.log.args[0], [ 'test123', 'test2', 1234 ]);
            manager.log("test");
            assert.deepEqual(context.log.args[1], [ 'test' ]);
            manager.log();
            assert.deepEqual(context.log.args[2], []);
        });
    });
});