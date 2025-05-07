var model = require('../model/adContractList')

module.exports.ContractList = async (req, res) => {
    try {
        var { user_id, type } = req.body

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
            condition = `WHERE ui.ui_u_id ='${user_id}'`
        }

        var contractsData = await model.GetUserContractList(condition, type)


        if (contractsData.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved successfully",
                data: contractsData
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