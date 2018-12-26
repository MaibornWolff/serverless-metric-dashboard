const serverlessMetrics = require("promes");
const resizer = require("../lib/imageResizer");

module.exports = function (context, message) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart(true, 200);
    //context.log(context);
    context.log('JavaScript queue trigger function processed work item', message);

    resizer.resize(context, message.blobname, "images-unprocessed-loose", "images-processed-loose", message.size, () => {
        context.log("Reached end in callback function");
        metrics.logFunctionEnd();
        context.done(null, "Hello!");
    });

    context.log("Reached the end in main function!")
};