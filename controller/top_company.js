let model = require('../model/top_company')

module.exports.ListTopCompany = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let list = await model.ListTopCompany()
        if (list.length) {
            return res.send({
                result: true,
                message: "Data retrieved successfully",
                data: list
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to retrieve data"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}