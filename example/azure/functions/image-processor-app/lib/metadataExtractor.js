const storage = require("azure-storage");
var ExifImage = require('exif').ExifImage;
const fs = require('fs');
const path = require('path');

module.exports.extractAndSave = function (context, container, blobname, callback) {
    const blobService = storage.createBlobService(process.env['AzureWebJobsStorage']);

    const imageName = blobname;
    const imagePath = path.join(process.env['TMP'], imageName);
    context.log(imagePath);

    var writable = fs.createWriteStream(imagePath);
    blobService.getBlobToStream(container, imageName, writable, function (error, result, response) {
        if (error) {
            context.log(error);
        }
        try {
            new ExifImage({ image: imagePath }, function (error, exifData) {
                if (error) {
                    context.log('Error: ' + error.message);
                    context.done(error, 'Error!');
                } else {
                    context.bindings.exifData = JSON.stringify({
                        make: exifData.image.Make,
                        model: exifData.image.Model,
                        iso: exifData.exif.ISO,
                        name: imageName
                    });
                    callback();
                }
            });
        } catch (error) {
            context.log('Error: ' + error.message);
            context.done(error, 'Error!');
        }
    });
};
