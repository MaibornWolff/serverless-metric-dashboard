const serverlessMetrics = require("promes");
const resizer = require("../lib/imageResizer");

module.exports = function (context) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart();
    context.log('Skipping logging context');
    //context.log(context);

    const widthInPixels = context.bindings.input.size;
    const imageIdentOld = context.bindings.input.name;

    resizer.resize(context, imageIdentOld, "images-unprocessed-durable", "images-processed-durable", widthInPixels, () => {
        context.log("Reached end in callback function");
        metrics.logFunctionEnd();
        context.done(null, "Hello!");
    });
   context.log("End of function");
};
