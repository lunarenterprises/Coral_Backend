var model = require('../model/nomineelist')


module.exports.NomineeList = async (req, res) => {
    try {
        let { user_id } = req.user
        let data = await model.getnominee(user_id)
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