var model = require('../model/UserKycData')

module.exports.GetUserKycData = async (req, res) => {
    try {
        var { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "user_id is required"
            })
        }
        let projects = await model.GetUserKycData(user_id)
        if (projects.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved successfully",
                data: projects
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