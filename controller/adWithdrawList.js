var model = require('../model/adWithdrawList')

module.exports.WithdrawRequestList = async (req, res) => {
    try {
        var { user_id } = req.body

        let admin_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(admin_id, admin_role)
        if (adminData[0]?.ad_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        var condition = ''
        if (user_id) {
            condition = `WHERE wr.wr_u_id ='${user_id}'`
        }

        var withdrawData = await model.GetUserWithdraw(condition)


        if (withdrawData.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved successfully",
                data: withdrawData
            })
        } else {
            return res.send({
                result: false,
                message: "failed to get data"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}