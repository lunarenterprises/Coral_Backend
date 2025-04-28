var model = require('../model/listtopcompany')

module.exports.ListTopcompany = async (req, res) => {
    try {

        let { tc_id, filter, hgfs } = req.body
        var condition = ''
        if (tc_id) {
            condition = ` and tc_id ='${tc_id}'`
        }
        if (filter) {
            condition = ` and tc_name LIKE '%${filter}%' `
        }
        if (hgfs) {
            condition = ` ORDER BY tc_growth_percentage DESC `
        }

        let data = await model.ListTopcompanyquery(condition)

        if (data.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                data: data
            })
        } else {
            return res.send({
                result: false,
                message: "data not found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}