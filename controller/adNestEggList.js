var model = require('../model/adNestEggList')

module.exports.NestEggList = async (req, res) => {
    try {
        let { user_id } = req.headers

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
            condition = `WHERE ne.ne_u_id ='${user_id}'`
        }

        var nestegglist = await model.GetNestEggList(condition)

        return res.send({
            result: true,
            message: "data retrieved successfully",
            data: nestegglist
        })
        // if (nestegglist.length > 0) {
        //     return res.send({
        //         result: true,
        //         message: "data retrieved successfully",
        //         data: nestegglist
        //     })
        // } else {
        //     return res.send({
        //         result: false,
        //         message: "failed to get data"
        //     })
        // }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}