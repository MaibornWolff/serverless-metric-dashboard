const serverlessMetrics = require('promes');

module.exports = function (context, req) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart(true, 200);
    context.log('JavaScript HTTP trigger function processed a request.');
    //context.log('Context: ', context);

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
        metrics.logCustomMetric("hello_world_metric", 1, {helloWorld: "HelloWorld"}, false);
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
    metrics.logFunctionEnd();
    context.done();
};