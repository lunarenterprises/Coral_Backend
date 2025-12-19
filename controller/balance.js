var model = require('../model/balance')


module.exports.Balance = async (req, res) => {
    try {
        var { user_id } = req.user
        var getbalance = await model.Getbalance(user_id)
        if (getbalance.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                data: getbalance
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

