const serverlessMetrics = require("promes");

module.exports = async function (context, myBlob) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart(true, 200);
    context.log(context);

    resizing = [{
        blobname: context.bindingData.name + '.jpg',
        size: 50
    },
    {
        blobname: context.bindingData.name + '.jpg',
        size: 100
    },
    {
        blobname: context.bindingData.name + '.jpg',
        size: 200
    }];

    metadataextraction = {
        blobname: context.bindingData.name + '.jpg'
    }
    
    context.bindings.queueresizing = resizing;
    context.bindings.queuemetaextraction = metadataextraction;
    
    metrics.logFunctionEnd();
};