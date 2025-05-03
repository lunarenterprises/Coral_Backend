var model = require('../model/nestegglist')

module.exports.NestEggList = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "user_id is required"
            })
        }
        var data = await model.GetNestegg(user_id)
        var balance = await model.Getbalance(user_id)
        var wallet = await model.Getwallet(user_id)
        var latest_return = wallet[0]?.w_amount
        var previous_return = wallet[1]?.w_amount
        if (latest_return > previous_return) {
            var profit = (previous_return - latest_return / previous_return) * 100
        } else {
            var profit = (latest_return / previous_return) * 100
        }
        return res.send({
            result: true,
            message: "data retrieved",
            balance: balance[0]?.u_wallet || 0,
            profit: profit || 0,
            data: data
        })
        // if (data.length > 0) {
        //     return res.send({
        //         result: true,
        //         message: "data retrieved",
        //         balance: balance[0]?.u_wallet,
        //         profit: profit,
        //         data: data
        //     })
        // } else {
        //     return res.send({
        //         result: false,
        //         balance: balance[0]?.u_wallet,
        //         profit: profit || 0,
        //         message: "data not found"
        //     })
        // }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}