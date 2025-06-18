var model = require("../model/adStatus");
const path = require('path');
var fs = require("fs");
var formidable = require("formidable");

module.exports.addStatus = async (req, res) => {
    try {
        var form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "file upload failed!",
                    data: err,
                });

            }
            if (files.image) {
                var oldPath = files.image.filepath;
                var newPath =
                    process.cwd() + "/uploads/status/" +
                    files.image.originalFilename;
                let rawData = fs.readFileSync(oldPath);
                fs.writeFile(newPath, rawData, async function (err) {
                    if (err) console.log(err);
                    let imagepath = "uploads/status/" + files.image.originalFilename;

                    await model.AddimageQuery(imagepath);

                })
                return res.send({
                    result: true,
                    message: "status added successfully"
                })
            }
            else {
                return res.send({
                    result: false,
                    message: "status required "
                })
            }
        })

    } catch (error) {
        console.log(error);
        return res.send({
            result: false,
            message: error.message,
        })

    }
}

module.exports.listStatus = async (req, res) => {
    try {

        let listStatus = await model.listStatusQuery();
        if (listStatus.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                list: listStatus,

            });

        } else {
            return res.send({
                result: false,
                messsage: "data not found",
            });
        }

    } catch (error) {
        return res.send({
            reult: false,
            message: error.message,
        });

    }
}

module.exports.deleteStatus = async (req, res) => {
    try {
        let st_id = req.body.st_id;
        if (!st_id) {
            return res.send({
                result: false,
                message: "missing id",
            })
        }

        let checkStatus = await model.checkStatusQuery(st_id);

        if (checkStatus.length > 0) {

            var deletesection = await model.removeStatusQuery(st_id);
            if (deletesection.affectedRows > 0) {
                return res.send({
                    result: true,
                    message: "status deleted successfully"
                })
            } else {
                return res.send({
                    result: false,
                    message: "failed to delete status",
                })
            }

        } else {
            return res.send({
                result: false,
                message: "Status details not found",
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });
    }


}
