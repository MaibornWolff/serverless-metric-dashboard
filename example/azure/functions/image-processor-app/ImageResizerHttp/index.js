const serverlessMetrics = require("promes");
const resizer = require("../lib/imageResizer");
const storage = require('azure-storage');

const sourceContainer = "images-unprocessed-http";
const targetContainer = "images-processed-http";

module.exports = function (context, req) {
    const metrics = new serverlessMetrics.FunctionMetrics(new serverlessMetrics.AzureMetadataManager(context));

    metrics.logFunctionStart(true, 200);

    var size = 200;
    if (req.query.size) {
        context.log("Given size was: " + req.query.size);
        size = parseInt(req.query.size);
        if (size == NaN) {
            context.log("Could not parse given size, using 200 as default");
            size = 200;
        }
    }
    const blobService = storage.createBlobService(process.env['AzureWebJobsStorage']);
    blobService.listBlobsSegmented(sourceContainer, null, (error, result) => {
        if (error) {
            context.log(error);
            metrics.logFunctionEnd();
            context.done(error);
            return;
        }

        context.log(result);

        if (result.entries.length == 0) {
            context.log("No files to resize found, doing nothing");
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: "No files found"
            };
            metrics.logFunctionEnd();
            context.done();
            return;
        }
        var file = result.entries[0];
        context.log("Resizing image: " + file.name);
        resizer.resize(context, file.name, sourceContainer, targetContainer, size, () => {
            
            blobService.deleteBlob(sourceContainer, file.name, (error) => {
                if (error) {
                    context.log(error);
                }
            });
            
            metrics.logFunctionEnd();
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: "Successfully resized image: " + file.name
            };
            context.done();
            return;
        });
    });
}