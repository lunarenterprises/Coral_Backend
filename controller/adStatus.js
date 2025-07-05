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

            let user_id = req.user.admin_id;
            let admin_role = req.user.role;

            var adminData = await model.getAdmin(user_id, admin_role);
            if (adminData[0]?.ad_role == "user") {
                return res.send({
                    result: false,
                    message: "Access Denied,try with authorized account",
                });
            }

            if (files.image) {
                const writeFileAsync = util.promisify(fs.writeFile);
                const oldPath = files.image.filepath;
                const originalFilename = files.image.originalFilename;

                // Centralized EBS-mounted directory
                const ebsDir = '/mnt/ebs500/uploads/status';
                const newPath = path.join(ebsDir, originalFilename);

                // Ensure the directory exists
                if (!fs.existsSync(ebsDir)) {
                    fs.mkdirSync(ebsDir, { recursive: true });
                }

                // Read and write the file
                const rawData = fs.readFileSync(oldPath);
                await writeFileAsync(newPath, rawData);

                // Store relative path (public URL will be resolved later)
                const imagePath = `uploads/status/${originalFilename}`;

                // Save path in DB
                await model.AddimageQuery(imagePath);

                return res.send({
                    result: true,
                    message: "status added successfully"
                });
            } else {
                return res.send({
                    result: false,
                    message: "image required"
                });
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
        console.log("req.user : ", req.user)
        let user_id = req.user?.admin_id;
        let admin_role = req.user.role;

        var adminData = await model.getAdmin(user_id, admin_role);
        if (adminData[0]?.ad_role == "user") {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account",
            });
        }

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
