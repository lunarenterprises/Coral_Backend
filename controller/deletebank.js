var model = require('../model/deletebank')
let userModel = require('../model/users')
let notification = require('../util/saveNotification')

module.exports.DeleteBank = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User ID is required"
            })
        }
        let { b_id } = req.body;
        if (!b_id) {
            return res.send({
                result: false,
                message: "Bank ID is required"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({
                result: false,
                message: "User not found"
            })
        }
        let deleted = await model.Deletebank(b_id)
        if (deleted.affectedRows > 0) {
            await model.UpdateKycStatus(user_id)
            await notification.addNotification(user_id, userData[0].u_role, "Bank Deleted", "Bank Deleted Successfully")
            return res.send({
                result: true,
                message: "bank deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "failed to delete bank"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}