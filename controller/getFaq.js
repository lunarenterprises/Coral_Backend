var model = require('../model/getFaq')
let userModel = require('../model/users')
let { SendMessage } = require('../util/firebaseConfig')

module.exports.GetFaq = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "User Id is required"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length === 0) {
            return res.send({
                result: false,
                message: "User is not found"
            })
        }
        let faqData = await model.GetFaq()
        await SendMessage(user_id, "Fetch FAQ", "Fetched FAQ Successfully.!")
        if (faqData.length === 0) {
            return res.send({
                result: false,
                message: "Faq not found"
            })
        } else {
            return res.send({
                result: true,
                message: "Data retrived successfully",
                data: faqData
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }


}