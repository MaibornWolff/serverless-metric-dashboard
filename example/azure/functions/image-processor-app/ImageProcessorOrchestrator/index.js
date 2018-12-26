const df = require("durable-functions");
const serverlessMetrics = require("promes");
const IMAGE_RESIZER = "ImageResizerDurable";

module.exports = df.orchestrator(function* (context) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart();
    //context.log(context);
    const blob_name = context.df.getInput();

    const tasks = [];
    tasks.push(context.df.callActivity("ExifExtractorDurable", blob_name));
    tasks.push(context.df.callActivity(IMAGE_RESIZER, {"name": blob_name, "size": 100}));
    tasks.push(context.df.callActivity(IMAGE_RESIZER, {"name": blob_name, "size": 200}));
    tasks.push(context.df.callActivity(IMAGE_RESIZER, {"name": blob_name, "size": 300}));

    const results = yield context.df.Task.all(tasks);

    metrics.logFunctionEnd();
    return "";
});