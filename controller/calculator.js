var model = require('../model/calculator')
var nodemailer = require('nodemailer')
let { matchesDuration } = require('../util/compareDuration')
let moment = require('moment')

module.exports.Calculator = async (req, res) => {
    try {
        let { amount, duration, year, wf, project, platform, name, mobile } = req.body

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
        if (duration) {
            if (amount >= 3000001) {
                if (project === "Any") {
                    if (condition !== '') {
                        condition += ` AND ri_duration = '>=2.5' `
                    } else {
                        condition += ` where ri_duration = '>=2.5'`
                    }
                } else {

                }
            }
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
        // if (duration && amount > 100000 && amount < 3000001) {
        //     if (duration > 3) {
        //         if (condition !== '') {
        //             condition += ` AND ri_duration = '>3' `
        //         } else {
        //             condition += ` where ri_duration = '>3'`
        //         }
        //     } else {
        //         if (condition !== '') {
        //             condition += ` AND ri_duration = '${duration}' `
        //         } else {
        //             condition += ` where ri_duration = '${duration}'`
        //         }
        //     }
        // }
        if (wf && amount > 100000 && amount < 3000001 && project === "Any") {
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
        if (!matchesDuration(returns_data[0]?.ri_duration, duration)) {
            return res.send({
                result: false,
                message: `Duration should be ${returns_data[0]?.ri_duration}`
            })
        }

        if (returns_data.length > 0) {
            let calculate = ((Number(amount) * returns_data[0]?.ri_return_year) / 100) * Number(duration)
            let percent = returns_data[0]?.ri_return_year * Number(duration)

            if (platform == 'web') {
                let transporter = nodemailer.createTransport({
                    host: "smtp.hostinger.com",
                    port: 587,
                    auth: {
                        type: 'custom',
                        method: 'PLAIN',
                        user: 'coraluae@lunarenp.com',
                        pass: 'Coraluae@2024',
                    },
                });

                let info = await transporter.sendMail({
                    from: "CORAL WEALTH <coraluae@lunarenp.com>",
                    to: 'sales2@coraluae.com',
                    subject: 'calculator enquiry details',
                    html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Customer Details</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .customer-details {
                    margin-bottom: 20px;
                }
                .customer-details p {
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Calculator Enquiry Details</h1>
                <div class="customer-details">
                    <p>Name: <span id="customer-name">${name}</span></p>
                    <p>Phone: <span id="customer-phone">${mobile}</span></p>
                  <p>Invest Amount: <span id="customer-name">${amount}</span></p>
                  <p>Withdrawal Frequency: <span id="customer-name">${wf}</span></p>
                  <p>Duration: <span id="customer-name">${duration} year</span></p>
                </div>
            </div>
        </body>
        </html>`
                });

                nodemailer.getTestMessageUrl(info);
            }

            return res.send({
                result: true,
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
        console.log(error);
        return res.send({
            result: false,
            message: error.message
        })
    }
}


