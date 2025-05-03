var model = require('../model/FutureInvestmentList')
let userModel = require('../model/users')
let { SendMessage } = require('../util/firebaseConfig')

module.exports.FutureInvestmentList = async (req, res) => {
    try {
        let { user_id } = req.headers
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
        let FutureInvestmentList = await model.GetFutureInvestmentList()
        // await SendMessage(user_id,userData[0].u_role, "Fetch FAQ", "Fetched FAQ Successfully.!")
        if (FutureInvestmentList.length === 0) {
            return res.send({
                result: false,
                message: "Data not found"
            })
        } else {
            return res.send({
                result: true,
                message: "Data retrived successfully",
                data: FutureInvestmentList
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }


}