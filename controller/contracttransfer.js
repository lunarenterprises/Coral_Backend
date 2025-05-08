var model = require('../model/contracttransfer')
let ticketModel = require('../model/ticket')
var nodemailer = require('nodemailer')
let notification = require('../util/saveNotification')


module.exports.ContractTransfer = async (req, res) => {
    try {
        let { user_id } = req.headers
        let { ui_id, n_id } = req.body
        if (!user_id) {
            return res.send({
                result: false,
                message: "user id required"
            })
        }
        if (!ui_id || !n_id) {
            return res.send({
                result: false,
                message: "missing required fields"
            })
        }
        let investedData = await model.getInvestedData(user_id)
        if (investedData[0].ui_status === "completed") {
            return res.send({
                result: false,
                message: "Investment period already completed."
            })
        }
        if (investedData[0].ui_request === "transfer") {
            return res.send({
                result: false,
                message: "Investment already requested for transfer"
            })
        }
        if (investedData[0].ui_request_status === "terminated") {
            return res.send({
                result: false,
                message: "Your Investment is terminated"
            })
        }
        if (investedData[0].ui_request === 'termination') {
            return res.send({
                result: false,
                message: "Investment already requested for termination"
            })
        }
        if (investedData[0].ui_transfer) {
            return res.send({
                result: false,
                message: "Investment already transferred to nominee"
            })
        }

        let update = await model.requestTransfer(ui_id)
        let ticket = await ticketModel.createTicket(user_id, "Requested for transfer contract", "Transfer contract")
        let users = await model.getUser(user_id)
        if (update.affectedRows > 0) {
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
                to: 'operations@coraluae.com',
                subject: 'Notification of Investment Transfer to Nominee',
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
                <p>Name: <span id="customer-name">${users.u_name}</span></p>
                <p>Phone: <span id="customer-phone">${users.mobile}</span></p>
              <p>Invest Amount: <span id="customer-name">${investedData[0].ui_amount}</span></p>
              <p>Withdrawal Frequency: <span id="customer-name">${10}</span></p>
              <p>Duration: <span id="customer-name">${2025} year</span></p>
            </div>
        </div>
    </body>
    </html>`
            });
            nodemailer.getTestMessageUrl(info);
            await notification.addNotification(user_id, users[0].u_role, 'Investment Transfer', 'Your investment has been successfully transferred to nominee')
            return res.send({
                result: true,
                message: "assgined to nominee successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "failed assign nominee to contract"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}