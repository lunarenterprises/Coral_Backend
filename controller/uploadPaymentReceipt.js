var formidable = require('formidable')
var moment = require('moment')
var fs = require('fs')
let userModel = require("../model/users")


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
                var oldPath3 = files.file.filepath;

                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                var newFilename = date + '_' + uniqueSuffix + '_' + files.file.originalFilename.replace(' ', '_');
                var newPath3 = process.cwd() + "/uploads/paymentreceipt/" + newFilename;

                if (!fs.existsSync(process.cwd() + "/uploads/paymentreceipt/")) {
                    fs.mkdirSync(process.cwd() + "/uploads/paymentreceipt/", { recursive: true });
                }

                fs.renameSync(oldPath3, newPath3);

                let filepath = "uploads/paymentreceipt/" + newFilename;

                let add = await userModel.UploadPaymentReceipt(investment_id, filepath)
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
            }
            else {
                if (!files.file || files.file.length === 0) {
                    return res.send({
                        result: false,
                        message: "please upload your payment receipt"
                    })
                }
            }
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}