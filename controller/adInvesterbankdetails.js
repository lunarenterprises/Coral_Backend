var model = require('../model/adInvesterbankdetails')

module.exports.InvesterBankDetails = async (req, res) => {
    try {

        let { user_id, user_name, user_number } = req.body

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
            condition = `where ui.ui_u_id='${user_id}' `
        }
        if (user_name) {
            condition = ` where (us.u_name like '%${user_name}%')`
        }
        if (user_number) {
            condition = ` where (us.u_mobile like '%${user_number}%')`
        }
        if (user_name && user_number) {
            condition = ` where (us.u_name like '%${user_name}%' or us.u_mobile like '%${user_number}%')`
        }
        var bankdetails = await model.getbank(condition)

        if (bankdetails.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                list: bankdetails
            })
        } else {
            return res.send({
                result: false,
                message: "data not found"
            })
        }
    } catch (error) {
        console.log(error);

        return res.send({
            result: false,
            message: error.message
        })
    }
}