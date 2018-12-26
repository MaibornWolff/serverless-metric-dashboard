const storage = require("azure-storage");
const serverlessMetrics = require("promes");

module.exports = function (context, req) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));
    metrics.logFunctionStart(true, 200);
    const blobService = storage.createBlobService(process.env['AzureWebJobsStorage']);

    blobService.listBlobsSegmented("images-unprocessed-durable", null, (error, result) => {
        if (error) {
            context.log(error);
            metrics.logFunctionEnd();
            context.done(error);
            return;
        }

        context.log(result);

        var currentTime = new Date();

        for (var i = 0; i < result.entries.length; i++) {
            if ((currentTime.getTime() - new Date(result.entries[i].lastModified).getTime()) > 3600000) {
                context.log(result.entries[i].name + " is too old! Deleting!");
                blobService.deleteBlob("images-unprocessed-durable", result.entries[i].name, (error) => {
                    if (error) {
                        context.log(error);
                    }
                });
            }
        }

        blobService.listBlobsSegmented("images-unprocessed-loose", result.continuationToken, (error, result) => {
            if (error) {
                context.log(error);
                metrics.logFunctionEnd();
                context.done(error);
                return;
            }

            for (var i = 0; i < result.entries.length; i++) {
                if ((currentTime.getTime() - new Date(result.entries[i].lastModified).getTime()) > 3600000) {
                    context.log(result.entries[i].name + " is too old! Deleting!");
                    blobService.deleteBlob("images-unprocessed-loose", result.entries[i].name, (error) => {
                        if (error) {
                            context.log(error);
                        }
                    });
                }
            }
            metrics.logFunctionEnd();
            context.done();
        });
    });
};