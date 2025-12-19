var model = require('../model/currentInvestment')
let notification = require('../util/saveNotification')
let userModel = require('../model/users')

module.exports.currentInvestment = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: 'user_id is required'
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({
                result: false,
                message: 'user not found'
            })
        }
        let investedData = await model.getInvestedData(user_id)
        if (investedData.length > 0) {
            await notification.addNotification(user_id,userData[0].u_role, "Current_Investment", "User has checked current investment", "success")
            return res.send({
                result: true,
                message: investedData
            })
        } else {
            return res.send({
                result: false,
                message: "no data found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
