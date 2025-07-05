const model = require('../model/status')


module.exports.ListAllStatus = async (req, res) => {
    try {
        let status = await model.ListAllStatus()
        if (status.length == 0) {
            return res.send({
                result: false,
                message: "No status found."
            })
        }
        return res.send({
            result: true,
            status,
            message: "Retrieved status successfully"
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}