var model = require('../model/updateNotification')
let notification = require('../util/saveNotification')
let userModel = require('../model/users')

module.exports.UpdateNotification = async (req, res) => {
    try {
        let { user_id } = req.user
        let { u_isNotificationTrue } = req.body;

        if (u_isNotificationTrue === null || u_isNotificationTrue === undefined || !user_id) {
            return res.send({
                result: false,
                message: "Please provide data"
            });
        }

        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({
                result: false,
                message: "User not found"
            });
        }

        let data = await model.updateNotification(user_id, u_isNotificationTrue)
        if (data.affectedRows == 1) {
            await notification.addNotification(user_id, userData[0].u_role, "Notification toggle updated", `Notification toggle updated to ${u_isNotificationTrue}`)
            return res.send({
                result: true,
                message: "Notification updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Notification not updated"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}