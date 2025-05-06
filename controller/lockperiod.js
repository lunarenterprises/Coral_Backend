var model = require('../model/lockperiod')
var moment = require('moment')

module.exports.LockPeriod = async (req, res) => {
    try {
        var date = moment().format('YYYY-MM-DD')
        let { user_id } = req.headers
        let { amount, year, wf, project, profit_model } = req.body
        if (!wf) {
            wf = 'Yearly'
        }

        let cutyear = year.split(',')[1]
        let givenyear = Number(cutyear)
        var getyear = moment().format('YYYY')
        var yearto = Number(getyear)
        year = Number(givenyear) - Number(yearto)
        let condition = ``
        if (amount < 100000) {
            if (condition !== '') {
                condition += ` AND (ri_amount_from = '100000' AND ri_amount_to is null)`
            } else {
                condition += ` where (ri_amount_from = '100000' AND ri_amount_to is null)`
            }
        } else if (amount > 3000000) {
            if (condition !== '') {
                condition += ` AND (ri_amount_from is null AND ri_amount_to  = '3000000')`
            } else {
                condition += ` where (ri_amount_from is null AND ri_amount_to = '3000000')`
            }
        } else {
            if (condition !== '') {
                condition += ` AND ('${amount}' BETWEEN ri_amount_from AND ri_amount_to)`
            } else {
                condition += ` where ('${amount}' BETWEEN ri_amount_from AND ri_amount_to)`
            }
        }
        if (project == 'any') {
            if (amount > 100000) {
                if (year > 3) {
                    if (condition !== '') {
                        condition += ` AND ri_duration = '>3' `
                    } else {
                        condition += ` where ri_duration = '>3'`
                    }
                } else {
                    if (condition !== '') {
                        condition += ` AND ri_duration = '${year}' `
                    } else {
                        condition += ` where ri_duration = '${year}'`
                    }
                }
                if (wf) {
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
                        condition += ` AND ri_project = 'any' `
                    } else {
                        condition += ` where ri_project = 'any'`
                    }
                }
            }
        } else {
            if (condition !== '') {
                condition += ` AND ri_project = '${project}' `
            } else {
                condition += ` where ri_project = '${project}'`
            }
        }


        let returns_data = await model.getinvest(condition)
        if (returns_data.length > 0) {
            if (project == 'any') {
                if (wf.toLowerCase().includes('monthly')) {
                    var calculate = Number(amount) + (Number(amount) * returns_data[0].ri_return_month / 100)
                    var percent = returns_data[0].ri_return_month
                } else if (wf.toLowerCase().includes('quarterly')) {
                    var calculate = Number(amount) + (Number(amount) * (returns_data[0].ri_return_month * 4) / 100)
                    var percent = (returns_data[0].ri_return_month * 4)
                } else if (wf.toLowerCase().includes('half-yearly')) {
                    var calculate = Number(amount) + (Number(amount) * (returns_data[0].ri_return_month * 6) / 100)
                    var percent = (returns_data[0].ri_return_month * 6)
                } else {
                    var calculate = Number(amount) + (Number(amount) * returns_data[0].ri_return_year / 100)
                    var percent = returns_data[0].ri_return_year
                }
            } else {
                if (wf.toLowerCase().includes('monthly')) {
                    var cal = (Number(amount) * returns_data[0].ri_return_month / 100) * year
                    var calculate = Number(amount) + cal
                    var percent = returns_data[0].ri_return_month * year
                } else if (wf.toLowerCase().includes('quarterly')) {
                    var cal = (Number(amount) * (returns_data[0].ri_return_month * 4) / 100) * year
                    var calculate = Number(amount) + cal
                    var percent = (returns_data[0].ri_return_month * 4) * year
                } else if (wf.toLowerCase().includes('half-yearly')) {
                    var cal = (Number(amount) * (returns_data[0].ri_return_month * 6) / 100) * year
                    var calculate = Number(amount) + cal
                    var percent = (returns_data[0].ri_return_month * 6) * year
                } else {
                    var cal = (Number(amount) * returns_data[0].ri_return_year / 100) * year
                    var calculate = Number(amount) + cal
                    var percent = returns_data[0].ri_return_year * year
                }
            }
            let lockperiod = await model.lock(user_id, percent, date, amount, year, project, wf, calculate, profit_model)


            return res.send({
                result: true,
                message: `${percent} percent in ${returns_data[0]?.ri_project} has been locked for you`,
                return_amount: calculate.toFixed(2),
                percentage: percent + '%'
            })

        } else {

        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}