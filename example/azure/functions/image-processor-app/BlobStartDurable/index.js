const uuidv1 = require("uuid/v1");
const serverlessMetrics = require("promes");

module.exports = async function (context, myBlob) {
    //context.log("Aggregator Address: ", process.env['PROMETHEUS_AGGREGATOR_ADDRESS']);
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart();
    //context.log(context);

    context.log("JavaScript blob trigger function processed blob \n Name:", context.bindingData.name, "\n Blob Size:", myBlob.length, "Bytes");

    const id = uuidv1();
    let startArgs = [{
        FunctionName: 'ImageProcessorOrchestrator',
        Input: context.bindingData.name + '.jpg',
        InstanceId: id
    }];

    context.bindings.starter = startArgs;
    
    metrics.logFunctionEnd();
};