var model = require('../model/adPayoutHistory')

module.exports.PayoutHistory = async (req, res) => {
    try {
        let { user_id } = req.headers

        let admin_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(admin_id, admin_role)
        if (adminData[0]?.u_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        var condition = ''
        if (user_id) {
            condition = `WHERE payout_history.ph_invest_u_id ='${user_id}'`
        }

        var payouthistorylist = await model.getPayoutHistory(condition)

        if (payouthistorylist.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved successfully",
                data: payouthistorylist
            })
        } else {
            return res.send({
                result: false,
                message: "No payout cycle found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}