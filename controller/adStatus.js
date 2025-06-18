var model = require("../model/adStatus");
const path = require('path');
var fs = require("fs");
const util = require("util");
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
                const writeFileAsync = util.promisify(fs.writeFile);
                const oldPath = files.image.filepath;
                const originalFilename = files.image.originalFilename;
                const dirname = path.join(__dirname, "../uploads/status");
                const newPath = path.join(dirname, originalFilename); // safer than using `process.cwd()`

                // Ensure directory exists
                if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname, { recursive: true });
                }

                // Read and write file
                const rawData = fs.readFileSync(oldPath);
                await writeFileAsync(newPath, rawData); // use async/await style for consistency

                const imagePath = "uploads/status/" + originalFilename;

                // Save in DB
                await model.AddimageQuery(imagePath);

                return res.send({
                    result: true,
                    message: "Status added successfully",
                    image: imagePath,
                });
            } else {
                return res.send({
                    result: false,
                    message: "image required "
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
