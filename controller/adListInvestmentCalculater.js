var model = require('../model/adListInvestmentCalculater')

module.exports.InvestmentCalculaterList = async (req, res) => {

    try {

        let user_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.CheckAdmin(user_id, admin_role)
        if (adminData[0]?.ad_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        var getinvestmenycalculater = await model.getInvestmenyCalculaterist()

        if (getinvestmenycalculater.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                data: getinvestmenycalculater
            })
        } else {
            return res.send({
                result: false,
                message: "investment calculater details not found"
            })
        }



    } catch (error) {
        console.log(error, "errr");

        return res.send({
            result: false,
            message: error.message
        })

    }

}