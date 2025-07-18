var model = require('../model/nestegg')
var moment = require('moment')
let notification = require('../util/saveNotification')
let userModel = require('../model/users')

module.exports.NestEggs = async (req, res) => {
    try {
        var date = moment().format("YYYY-MM-DD")
        var { user_id } = req.headers
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
        var { w_id, amount, duration, wfa_password } = req.body
        var checkwfa = await model.checkwfa(user_id, wfa_password)
        if (checkwfa.length == 0) {
            return res.send({
                result: false,
                message: "wrong wfa password"
            })
        } else {
            if (userData[0].u_wallet < amount) {
                return res.send({
                    result: false,
                    message: "Wallet doesn't sufficient amount"
                })
            }
            let insert = await model.AddNest(amount, w_id, duration, user_id, date)
            if (insert.affectedRows > 0) {
                let update = await model.UpdateUser(user_id, amount)
                await notification.addNotification(user_id, userData[0].u_role, "Invested in nestegg", `You have invested ${amount} in nestegg`)
                return res.send({
                    result: true,
                    message: "invested successfully"
                })
            } else {
                return res.send({
                    result: false,
                    message: "failed to invest"
                })
            }
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}