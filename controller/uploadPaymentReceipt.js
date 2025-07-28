var formidable = require('formidable')
var moment = require('moment')
var fs = require('fs')
let userModel = require("../model/users")
let path = require('path')


module.exports.UploadPaymentReceipt = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length === 0) {
            return res.send({
                result: false,
                message: "User not found"
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
            let { investment_id } = fields
            if (!investment_id) {
                return res.send({
                    result: false,
                    message: "Investment id is required"
                })
            }

            if (files.file) {
                const oldPath3 = files.file.filepath;

                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const newFilename = date + '_' + uniqueSuffix + '_' + files.file.originalFilename.replace(/ /g, '_');

                const ebsDir = '/mnt/ebs500/uploads/paymentreceipt';
                const newPath3 = path.join(ebsDir, newFilename);

                // Ensure EBS directory exists
                if (!fs.existsSync(ebsDir)) {
                    fs.mkdirSync(ebsDir, { recursive: true });
                }

                // Move file from temp to EBS directory
                // fs.renameSync(oldPath3, newPath3);
                // ❗ Fix: Use copy + delete instead of rename to avoid EXDEV error
                fs.copyFileSync(oldPath3, newPath3);
                fs.unlinkSync(oldPath3); // Remove the temp file

                // Relative path for DB and access
                const filepath = "uploads/paymentreceipt/" + newFilename;

                const add = await userModel.UploadPaymentReceipt(investment_id, filepath);
                if (add.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "Payment receipt uploaded successfully",
                    });
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to upload payment receipt",
                    });
                }
            } else {
                return res.send({
                    result: false,
                    message: "Please upload your payment receipt"
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