var model = require('../model/calculator')
var nodemailer = require('nodemailer')
const { matchesDuration } = require('../util/compareDuration')
const { filterReturns } = require('../util/calculator')

module.exports.Calculator = async (req, res) => {
    try {
        let { amount, duration, wf, project, platform, name, mobile } = req.body;
        if (!amount || amount < 52000) {
            return res.send({
                result: false,
                message: "Amount should be greater than 52000 AED"
            })
        }
        const condition = `WHERE ri_amount_from <= ${amount} 
  AND (ri_amount_to IS NULL OR ${amount} <= ri_amount_to)
  AND ri_project = '${project || 'Any'}';
`
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

            if (platform == 'web') {
                let transporter = nodemailer.createTransport({
                    host: "smtp.hostinger.com",
                    port: 587,
                    auth: {
                        type: 'custom',
                        method: 'PLAIN',
                        user: 'nocontact@lunarenp.com',
                        pass: 'Cwicoral@123',
                    },
                });

                let info = await transporter.sendMail({
                    from: "CORAL WEALTH <nocontact@lunarenp.com>",
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


