var model = require('../model/Addnominee')
var formidable = require('formidable')
var moment = require('moment')
var fs = require('fs')
let notification = require('../util/saveNotification')
let userModel = require("../model/users")


module.exports.uploadNomineeForm = async (req, res) => {
    try {
        let { id, user_id } = req.headers
        if (!id) {
            return res.send({
                result: false,
                message: "please provide nominee id"
            })
        }
        if (!user_id) {
            return res.send({
                result: false,
                message: "please provide user id"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length <= 0) {
            return res.send({
                result: false,
                message: "Invalid user id"
            })
        }
        var form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }
            var date = moment().format('YYYY_MM_DD')

            if (files.image) {
                const oldPath3 = files.image.filepath;

                // Generate a unique filename
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const newFilename = date + '_' + uniqueSuffix + '_' + files.image.originalFilename.replace(/ /g, '_');

                const ebsDir = '/mnt/ebs500/uploads/nomineeForm';
                const newPath3 = path.join(ebsDir, newFilename);

                // Ensure EBS directory exists
                if (!fs.existsSync(ebsDir)) {
                    fs.mkdirSync(ebsDir, { recursive: true });
                }

                // Move the uploaded file
                // fs.renameSync(oldPath3, newPath3);
                // ❗ Fix: Use copy + delete instead of rename to avoid EXDEV error
                fs.copyFileSync(oldPath3, newPath3);
                fs.unlinkSync(oldPath3); // Remove the temp file

                // Save relative path for database and frontend access
                const form = "uploads/nomineeForm/" + newFilename;

                // Save in database
                const add = await model.uploadNomineeForm(id, form);
                if (add.affectedRows > 0) {
                    await notification.addNotification(user_id, userData[0].u_role, "Nominee Form uploaded", "Nominee form uploaded successfully");
                    return res.send({
                        result: true,
                        message: "Nominee form uploaded successfully"
                    });
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to upload nominee form"
                    });
                }
            } else {
                return res.send({
                    result: false,
                    message: "Please upload your nominee form"
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