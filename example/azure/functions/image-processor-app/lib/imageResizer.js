const storage = require("azure-storage");
const stream = require('stream');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

module.exports.resize = function (context, blobName, blobContainerSource, blobContainerTarget, widthInPixels, callback) {
    const blobService = storage.createBlobService(process.env['AzureWebJobsStorage']);
    context.log(widthInPixels);

    const imageIdentOld = blobName;
    const imageName = imageIdentOld.slice(0, -4); // cut file extension

    const imageIdentNew = imageName + '_' + widthInPixels + '.jpg';
    const imagePath = path.join(process.env['TMP'], imageIdentNew);
    context.log(imagePath);

    var writable = fs.createWriteStream(imagePath);
    blobService.getBlobToStream(blobContainerSource, imageIdentOld, writable, function (error) {
        context.log("Reached blobstreambody");
        if (error) {
            context.log(error);
        }

        Jimp.read(imagePath).then((thumbnail) => {
            context.log(widthInPixels);
            thumbnail.resize(widthInPixels, Jimp.AUTO);
    
            const options = {
                contentSettings: { contentType: 'image/jpeg' }
            };
            thumbnail.getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
    
                const readStream = stream.PassThrough();
                readStream.end(buffer);
    
                blobService.createBlockBlobFromStream(blobContainerTarget, imageIdentNew, readStream, buffer.length, options, (err) => {
                    fs.unlinkSync(imagePath);
                    context.log("Reached end in resizer function");
                    callback();
                });
            });
        }).catch(context.log);
    });
};
