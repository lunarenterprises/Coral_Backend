var model = require('../model/editProfile')
var userModel = require('../model/users')
let notification = require('../util/saveNotification')


module.exports.EditUserProfile = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let { u_currency, u_gender, u_address, u_mobile, u_country } = req.body
        let userData = await userModel.getUser(user_id)
        if (userData.length === 0) {
            return res.send({
                result: false,
                message: "User data not found"
            })
        }
        if (!u_currency || !u_address || !u_mobile || !u_country) {
            return res.send({ result: false, message: "Please fill all the fields" })
        }
        let update = await model.EditProfile(user_id, u_currency.toUpperCase(), u_gender, u_address, u_mobile, u_country)
        if (update.affectedRows > 0) {
            await notification.addNotification(user_id, userData[0].u_role, "Profile Updated", "Your profile has been updated successfully")
            return res.send({
                result: true,
                message: "updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "failed to update"
            })
        }
    } catch (error) {
        console.error(error)
        return res.send({
            result: false,
            message: error.message
        })
    }
}