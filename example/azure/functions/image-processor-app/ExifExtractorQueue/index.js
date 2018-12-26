const serverlessMetrics = require("promes");
const metadataExtractor = require("../lib/metadataExtractor");

module.exports = function (context, message) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart(true, 200);

    metadataExtractor.extractAndSave(context, "images-unprocessed-loose", message.blobname, () => {
        context.log("Reached end in callback function");
        metrics.logFunctionEnd();
        context.done(null, "Hello!");
    });
};