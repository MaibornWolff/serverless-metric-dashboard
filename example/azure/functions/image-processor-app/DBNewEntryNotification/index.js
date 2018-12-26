const serverlessMetrics = require("promes");

module.exports = function (context, documents) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart();
    //context.log(context);
    context.log(documents);
    var length = documents.length;
    for (var i = 0; i < length; i++) {
        var document = documents[i];
        context.log(document);
        context.log('Modified or new entry: Name: ' + document.name + " Make: " + document.make + " Model: " + document.model + " Iso: " + document.iso);
    }
    metrics.logFunctionEnd();
    context.done();
}