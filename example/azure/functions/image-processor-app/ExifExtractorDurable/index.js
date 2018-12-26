const serverlessMetrics = require("promes");
const metadataExtractor = require("../lib/metadataExtractor");

module.exports = function (context) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart();

    metadataExtractor.extractAndSave(context, "images-unprocessed-durable", context.bindings.blobname, () => {
        context.log("Reached end in callback function");
        metrics.logFunctionEnd();
        context.done(null, "Hello!");
    });
};
