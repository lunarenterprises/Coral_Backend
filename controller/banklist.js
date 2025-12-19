var model = require('../model/banklist')

module.exports.BankList = async (req, res) => {
    try {
        let { user_id } = req.user
        let bank = await model.getbank(user_id)
        if (bank.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                list: bank
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