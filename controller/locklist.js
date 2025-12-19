var model = require('../model/locklist')
var moment = require('moment')

module.exports.LockList = async (req, res) => {
    try {
        let { user_id } = req.user
        let condition = ''
        if (user_id) {
            condition = `where lp_u_id ='${user_id}'`
        }
        let lockdata = await model.getinvest(condition)
        var total = 0
        lockdata.forEach(element => {
            total += element.lp_amount
            var dat = moment(element.lp_date).add(3, 'months').format("YYYY-MM-DD")
            var today = moment().format("YYYY-MM-DD")
            if (dat < today) {
                element.status = 'expired'
            } else {
                element.status = 'active'
            }
        });
        if (lockdata.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                total: total,
                list: lockdata
            })
        } else {
            return res.send({
                result: false,
                message: "no data found"
            })
        }


    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}