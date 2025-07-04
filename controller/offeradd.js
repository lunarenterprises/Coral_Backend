var model = require('../model/offeradd')
var formidable = require('formidable')
var moment = require('moment')
var fs = require('fs')
const { saveFile } = require('../util/uploadFile')
// let notification=require('../util/saveNotification')

module.exports.OfferAdd = async (req, res) => {
    try {
        var date = moment().format('YYYY_MM_DD')
        var form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }
            var name = fields.name || null
            var description = fields.description || null
            if (files.image) {
                const cleanedName = files.image.originalFilename.replace(/ /g, '_');
                const filename = `${date}_${cleanedName}`;
                const image = saveFile(files.image.filepath, 'offer', filename);

                const upload = await model.AddOffer(name, description, image);

                if (upload.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "Offer added successfully"
                    });
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to add offer"
                    });
                }
            } else {
                return res.send({
                    result: false,
                    message: "Please select an image"
                });
            }
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}