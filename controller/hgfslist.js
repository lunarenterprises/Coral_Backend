var model = require('../model/hgfslist')


module.exports.HgfsList = async (req, res) => {
    try {
        let { user_id } = req.user
        let own_shares = 0
        let share_prices = 0
        let hgfsList = await model.GetHgfs()
        var getbalance = await model.Getbalance(user_id)
        var userinvest = await model.GetUserInvest(user_id)
        own_shares = userinvest.length
        userinvest.forEach(element => {
            share_prices += element.ui_amount
        });
        return res.send({
            result: true,
            message: "data retrieved",
            currency: getbalance[0]?.u_currency,
            user_status: getbalance[0]?.u_status,
            user_kyc: getbalance[0]?.u_kyc,
            balance: getbalance[0]?.u_returned_amount,
            own_shares: own_shares,
            share_prices: share_prices,
            data: hgfsList,

        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }


}