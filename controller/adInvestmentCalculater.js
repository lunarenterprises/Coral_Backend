var model = require('../model/adInvestmentCalculater')
let notification = require('../util/saveNotification')

module.exports.AddInvestmentCalculater = async (req, res) => {
    try {

        let user_id = req.user.admin_id
        let admin_role = req.user.role


        var adminData = await model.getAdmin(user_id, admin_role)

        if (adminData[0]?.ad_role !== 'superadmin') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        var { ri_project, ri_amount_from, ri_amount_to, ri_return_year, ri_return_month, ri_wf, ri_duration, ri_security } = req.body

        if (!ri_project || !ri_amount_from || !ri_amount_to || !ri_return_year || !ri_return_month || !ri_wf || !ri_duration || !ri_security) {
            return res.send({
                result: false,
                message: "Please fill all the fields"
            })
        }



        let addinvestmentcalculater = await model.AddInvestmentcalculater(ri_project, ri_amount_from, ri_amount_to, ri_return_year, ri_return_month, ri_wf, ri_duration, ri_security)

        if (addinvestmentcalculater.affectedRows > 0) {

            await notification.addNotification(user_id, admin_role, `${adminData[0]?.u_name} Added Investment Calculater Data`, "Investment calculater data added sucessfully")

            return res.send({
                result: true,
                message: "Investment Calculater Data added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Investment Calculater Data"
            })
        }

    } catch (error) {
        console.log(error, "rrrr");

        return res.send({
            result: false,
            message: error.message
        })
    }
}