const serverlessMetrics = require('promes');
const promClientMetrics = require('promces');

module.exports = function (context, req) {
    const metadataManager = new serverlessMetrics.AzureMetadataManager(context);
    const metrics = new serverlessMetrics.FunctionMetrics(metadataManager);
    const clientMetrics = new promClientMetrics.FunctionMetrics(metadataManager);
    clientMetrics.logFunctionStart();
    metrics.logFunctionStart(true, 200);
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
        metrics.logCustomMetric("hello_world_metric", 1, {helloWorld: "HelloWorld"}, false);
        clientMetrics.addCustomMetric("hello_world_metric_2", 1, "counter", {helloWorld: "HelloWorld"}, false);
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
    metrics.logFunctionEnd();
    clientMetrics.logFunctionEnd();
    context.done();
};