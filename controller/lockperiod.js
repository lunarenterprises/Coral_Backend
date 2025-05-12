var model = require('../model/lockperiod')
var moment = require('moment')
let { matchesDuration } = require('../util/compareDuration')

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
        if (!wf) {
            wf = 'Yearly'
        }
        if (!amount || amount < 52000) {
            return res.send({
                result: false,
                message: "Amount should be greater than 52000 AED"
            })
        }

        let condition = ``
        if (amount) {
            if (condition !== '') {
                condition += ` AND ((ri_amount_to IS NOT NULL AND ${amount} BETWEEN ri_amount_from AND ri_amount_to)
            OR (ri_amount_to IS NULL AND ${amount} >= ri_amount_from))
          `
            } else {
                condition += ` WHERE 
         ((ri_amount_to IS NOT NULL AND ${amount} BETWEEN ri_amount_from AND ri_amount_to)
            OR (ri_amount_to IS NULL AND ${amount} >= ri_amount_from))
          `
            }
        }
        if (duration && amount > 100000 && amount < 3000001) {
            if (duration > 3) {
                if (condition !== '') {
                    condition += ` AND ri_duration = '>3' `
                } else {
                    condition += ` where ri_duration = '>3'`
                }
            } else {
                if (condition !== '') {
                    condition += ` AND ri_duration = '${duration}' `
                } else {
                    condition += ` where ri_duration = '${duration}'`
                }
            }
        }
        if (wf && amount > 100000 && amount < 3000001) {
            if (condition !== '') {
                condition += ` AND ri_wf = '${wf}' `
            } else {
                condition += ` where ri_wf = '${wf}'`
            }
        }
        if (project) {
            if (condition !== '') {
                condition += ` AND ri_project = '${project}' `
            } else {
                condition += ` where ri_project = '${project}'`
            }
        } else {
            if (condition !== '') {
                condition += ` AND ri_project = 'Any' `
            } else {
                condition += ` where ri_project = 'Any'`
            }
        }
        let returns_data = await model.getinvest(condition)
        console.log("condition : ", condition)
        console.log("returns_data : ", returns_data)
        if (returns_data.length > 0) {
            if (returns_data[0]?.ri_duration && !matchesDuration(returns_data[0]?.ri_duration, duration)) {
                return res.send({
                    result: false,
                    message: `Duration should be ${returns_data[0]?.ri_duration}`
                })
            }
            let calculate = ((Number(amount) * returns_data[0]?.ri_return_year) / 100) * Number(duration)
            let percent = returns_data[0]?.ri_return_year * Number(duration)
            let futureDate = moment().add(parseFloat(investment.investment_duration), 'years');
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