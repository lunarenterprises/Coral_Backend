var model = require('../model/calculator')
var nodemailer = require('nodemailer')

module.exports.Calculator = async (req, res) => {
    try {
        let { amount, year, wf, project, platform, name, mobile } = req.body

        if(amount<52000){
            return res.send({
                result:false,
                message:"Amount should be greater than 52000 AED"
            })
        }

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
                    var percent = returns_data[0].ri_return_month
                } else if (wf.toLowerCase().includes('quarterly')) {
                    var cal = (Number(amount) * (returns_data[0].ri_return_month * 4) / 100) * year
                    var calculate = Number(amount) + cal
                    var percent = (returns_data[0].ri_return_month * 4)
                } else if (wf.toLowerCase().includes('half-yearly')) {
                    var cal = (Number(amount) * (returns_data[0].ri_return_month * 6) / 100) * year
                    var calculate = Number(amount) + cal
                    var percent = (returns_data[0].ri_return_month * 6)
                } else {
                    var cal = (Number(amount) * returns_data[0].ri_return_year / 100) * year
                    var calculate = Number(amount) + cal
                    var percent = returns_data[0].ri_return_year
                }
            }

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
                    to: 'sales2@coraluae.com,Mubashirpmmubz@gmail.com',
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
                  <p>Duration: <span id="customer-name">${year} year</span></p>
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
                message: "failed to get data"
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


