var model = require('../model/adminlist')

module.exports.AdminList = async (req, res) => {

    try {

        let user_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.CheckAdmin(user_id, admin_role)
        if (adminData[0]?.u_role !== 'superadmin') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        let admin_id = req.body.admin_id

        var condition = ''
        if (admin_id) {
            condition = ` and ad_id = '${admin_id}'`

        }


        var getadmin = await model.getAdminList(condition)

        let data = await Promise.all(getadmin.map(async (el) => {
            let adminaccess = el.ad_access;
            let access = await JSON.parse(adminaccess);
            el.ad_access = access;
            return el;
        }));

        return res.send({
            result: true,
            message: "data retrieved",
            data: data
        });



    } catch (error) {
        console.log(error, "errr");

        return res.send({
            result: false,
            message: error.message
        })

    }

}