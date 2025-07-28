var model = require('../model/adContractDownload')

module.exports.ContractDownload = async (req, res) => {

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

        var { contract_id } = req.headers
        var serverName = req.protocol + "://" + req.get("host");

        var getcontact = await model.getcontact(contract_id)

        var filename = getcontact[0]?.ui_contract_file


        if (getcontact.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                data: `${serverName}${filename}`
            })
        } else {
            return res.send({
                result: false,
                message: "contract data not found"
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