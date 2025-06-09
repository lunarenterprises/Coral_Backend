var model = require('../model/terminatecontract')
let ticketModel = require('../model/ticket')
var nodemailer = require('nodemailer')
let notification = require('../util/saveNotification')

module.exports.TerminateContract = async (req, res) => {
    try {
        let { ui_id, reason } = req.body
        if (!ui_id || !reason) {
            return res.send({
                result: false,
                message: "ui_id and reason is required"
            })
        }
        let usersdata = await model.getusersdata(ui_id)
        if (usersdata[0].ui_request === "termination") {
            return res.send({
                result: false,
                message: "Your contract is already requested for termination"
            })
        } else if (usersdata[0].ui_request_status === "terminated") {
            return res.send({
                result: false,
                message: "Your contract is already terminated"
            })
        }
        let terminate = await model.updateContract(ui_id, reason)
        let ticket = await ticketModel.createTicket(usersdata[0]?.u_id, "Requested for terminate contract", "Terminate contract")
        if (terminate.affectedRows > 0) {
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
                to: 'operations@coraluae.com',
                subject: 'contract terminate request',
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
            <h1>Contract Terminate Request</h1>
            <div class="customer-details">
                <p>Name: <span id="customer-name">${usersdata[0]?.u_name}</span></p>
                <p>Phone: <span id="customer-phone">${usersdata[0]?.u_mobile}</span></p>
                <p>Invest Amount: <span id="customer-name">${usersdata[0]?.ui_amount}</span></p>
                <p>Contract no.: <span id="customer-name">${usersdata[0]?.ui_id}</span></p>
            </div>
        </div>
    </body>
    </html>`
            });

            nodemailer.getTestMessageUrl(info);
            await notification.addNotification(usersdata[0].ui_u_id, usersdata[0].u_role, 'Contract Terminate Request', 'Your contract termination request has been sent to our representative, they will contact you soon.')
            return res.send({
                result: true,
                message: "Your termination request has been sent to our representative,they will contact you soon."
            })

        } else {
            return res.send({
                result: false,
                message: "failed to terminate contract"
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
