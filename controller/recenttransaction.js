var model = require('../model/recenttransaction')
var moment = require('moment')

module.exports.RecentTransaction = async (req, res) => {
    try {
        let { user_id } = req.user
        let users = await model.getUsers(user_id)
        let withdrawhistory = await model.getWithdraw(user_id)
        withdrawhistory.forEach(element => {
            element.method = 'withdraw'
            element.wr_date = moment().format("YYYY-MM-DD")
        });
        let investhistory = await model.getInvested(user_id)
        investhistory.forEach(element => {
            element.method = 'invest'
            element.wr_date = moment().format("YYYY-MM-DD")
        });
        var data = withdrawhistory.concat(investhistory)
        var orderedDate = data.sort((a, b) => {
            const dateCompareResult = new Date(a.wr_date) - new Date(b.wr_date);
            return dateCompareResult;
        });
        if (orderedDate.length == 0) {
            return res.send({
                result: false,
                message: 'data not found'
            })
        } else if (orderedDate.length > 5) {
            orderedDate.slice(0, 5)
            return res.send({
                result: true,
                message: 'data retrieved',
                data: orderedDate
            })
        } else {
            return res.send({
                result: true,
                message: 'data retrieved',
                data: orderedDate
            })
        }


    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}