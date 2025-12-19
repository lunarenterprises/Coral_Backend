var model = require('../model/checkeasypin')

module.exports.CheckEasyPin = async (req, res) => {
    try {
        let { user_id } = req.user
        let { pin } = req.body
        let CheckUser = await model.getUser(user_id, pin)
        if (CheckUser.length > 0) {
            return res.send({
                result: true,
                message: "login successful",
                user_id: CheckUser[0].u_id,
                user_name: CheckUser[0].u_name,
                user_email: CheckUser[0].u_email,
                user_mobile: CheckUser[0].u_mobile,
                user_role: CheckUser[0].u_role,
                user_status: CheckUser[0].u_status,
            })
        } else {
            return res.send({
                result: false,
                message: "wrong pin please try again"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.WfaCheckEasyPin = async (req, res) => {
    try {
        let { user_id } = req.user
        let { pin } = req.body
        let CheckUser = await model.getUser1(user_id, pin)
        if (CheckUser.length > 0) {
            return res.send({
                result: true,
                message: "login successful",
                user_id: CheckUser[0].u_id,
                user_name: CheckUser[0].u_name,
                user_email: CheckUser[0].u_email,
                user_mobile: CheckUser[0].u_mobile,
                user_role: CheckUser[0].u_role,
                user_status: CheckUser[0].u_status,
            })
        } else {
            return res.send({
                result: false,
                message: "wrong pin please try again"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}