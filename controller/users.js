var model = require('../model/users')

module.exports.Users = async (req, res) => {
    try {
        let { user_id } = req.user;
        if (!user_id) {
            return res.send({
                result: false,
                message: "user_id is required"
            })
        }
        let userdata = await model.getUser(user_id)
        if (userdata.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved successfully",
                data: userdata
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


module.exports.GetReturnChart = async (req, res) => {
    try {
        let { user_id } = req.user;
        if (!user_id) {
            return res.send({
                result: false,
                message: "user_id is required"
            })
        }
        const returnData = await model.GetReturnChart()
        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: returnData
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}