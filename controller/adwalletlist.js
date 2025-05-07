var model = require('../model/adwalletlist')

module.exports.WalletList = async (req, res) => {

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

        var u_id = req.body.u_id

        var condition = ''
        if (u_id) {
            condition = `where w_u_id = '${u_id}'`
        }

        var getadmin = await model.getWalletList(condition)

        if (getadmin.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                data: getadmin
            })
        } else {
            return res.send({
                result: false,
                message: "wallet details not found"
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