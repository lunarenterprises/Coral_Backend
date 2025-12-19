var model = require('../model/order_signing')
var formidable = require('formidable')
var fs = require('fs')
let userModel = require('../model/users')
let notification = require('../util/saveNotification')
const { saveFile } = require('../util/uploadFile')

module.exports.Order_Sign = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "user_id is required"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({
                result: false,
                message: "user not found"
            })
        }
        var form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "failed to upload file",
                    data: err,
                });
            }
            let contract_no = fields.contract_no
            if (!files.contract) {
                return res.send({
                    result: false,
                    message: "Please upload contract file"
                });
            }

            const timestamp = Date.now();
            const originalFilename = files.contract.originalFilename.replace(/ /g, '_');
            const filename = `client_${contract_no}_${timestamp}_${originalFilename}`;
            const filePath = saveFile(files.contract.filepath, 'user_needs', filename);

            await model.UpdateClientSign(filePath, contract_no);

            await notification.addNotification(
                user_id,
                userData[0]?.u_role || 'user',
                "Contract signed",
                "Signed contract uploaded successfully"
            );

            return res.send({
                result: true,
                message: "File uploaded successfully"
            });
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}