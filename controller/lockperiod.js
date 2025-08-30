var model = require('../model/lockperiod')
var moment = require('moment')
let { matchesDuration } = require('../util/compareDuration')
const { filterReturns } = require('../util/calculator')

module.exports.LockPeriod = async (req, res) => {
    try {
        var date = moment().format('YYYY-MM-DD')
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let { amount, duration, wf, project, profit_model } = req.body
        if (!amount || !duration || !project || !profit_model) {
            return res.send({
                result: false,
                message: "Amount, duration, project and profit model are required"
            })
        }
        if (!amount || amount < 52000) {
            return res.send({
                result: false,
                message: "Amount should be greater than 52000 AED"
            })
        }

        const condition = `WHERE ri_amount_from <= ${amount} 
  AND (ri_amount_to IS NULL OR ${amount} <= ri_amount_to)
  AND ri_project = '${project || 'Any'}'`
        console.log("lockperiod : ", req.body)
        let rawData = await model.getinvest(condition)
        let returns_data = filterReturns(rawData, duration, wf);
        if (returns_data.length === 0) {
            return res.send({ result: false, message: "No matching slab found" });
        }
        console.log("filtered : ", returns_data)
        if (returns_data.length > 0) {
            if (returns_data[0]?.ri_duration && !matchesDuration(returns_data[0]?.ri_duration, duration)) {
                return res.send({
                    result: false,
                    message: `Duration should be ${returns_data[0]?.ri_duration}`
                })
            }
            let calculate = ((Number(amount) * returns_data[0]?.ri_return_year) / 100) * Number(duration)
            let percent = returns_data[0]?.ri_return_year * Number(duration)
            let futureDate = moment().add(parseFloat(duration), 'years');
            let investment_duration = futureDate.format('YYYY/MM/DD');
            let lockperiod = await model.lock(user_id, percent, date, amount, investment_duration, project, wf, calculate, profit_model)
            return res.send({
                result: true,
                message: `${percent} percent in ${returns_data[0]?.ri_project} has been locked for you`,
                return_amount: calculate.toFixed(2),
                percentage: percent + '%'
            })

        } else {
            return res.send({
                result: false,
                message: "No data found."
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}