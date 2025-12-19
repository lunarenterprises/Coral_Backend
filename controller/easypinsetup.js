var model = require('../model/easypinsetup')
let notification = require('../util/saveNotification')
let userModel=require('../model/users')

module.exports.EasyPin = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "Please enter user_id"
            })
        }
        let { pin } = req.body
        if (!pin) {
            return res.send({
                result: false,
                message: "Please enter pin"
            })
        }
        let userData=await userModel.getUser(user_id)
        if(userData.length==0){
            return res.send({
                result: false,
                message: "User not found"
            })
        }
        let data = await model.updateUser(user_id, pin)
        if (data.affectedRows > 0) {
            await notification.addNotification(user_id,userData[0].u_role, "Pin Updated", "Your Pin updated successfully")
            return res.send({
                result: true,
                message: "Pin updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to update pin"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}