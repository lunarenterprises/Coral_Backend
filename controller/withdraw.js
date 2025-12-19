var model = require('../model/withdraw')
var nodemailer = require('nodemailer')
var moment = require('moment')
let notification=require('../util/saveNotification')
const { sendNotificationToAdmins } = require('../util/firebaseConfig')

module.exports.Withdraw = async (req, res) => {
    try {
        var date = moment().format("YYYY-MM-DD")
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
        let { user_id } = req.user;
        let { amount, bank_id, wfa_password } = req.body;
        let bank_details = await model.getBank(bank_id)
        let user_details = await model.getUser(user_id)
        if (user_details[0]?.u_wfa_password !== wfa_password) {
            return res.send({
                result: false,
                message: "Invalid WFA Password,Please try again"
            })
        }

        let result = await model.AddWithdraw(user_id, amount, bank_id, date);
        let info = await transporter.sendMail({
            from: "CORAL WEALTH <nocontact@lunarenp.com>",
            to: 'operations@coraluae.com',
            subject: 'Withdrawal Request',
            html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Withdrawal Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">

    <p>Dear Coral Wealth Team,</p>

    <p>There is a withdrawal request from <strong>${user_details[0]?.u_name}</strong>. Below are the details of the transaction:</p>

    <ul>
        <li><strong>Withdrawal Amount:</strong> ${amount}</li>
        <li><strong>Bank Name:</strong> ${bank_details[0]?.b_name}</li>
        <li><strong>Branch Name:</strong> ${bank_details[0]?.b_branch}</li>
        <li><strong>Account Number:</strong> ${bank_details[0]?.b_account_no}</li>
        <li><strong>IFSC Code/IBAN:</strong> ${bank_details[0]?.b_ifsc_code}</li>
        <li><strong>SWIFT Code:</strong> ${bank_details[0]?.b_swift_code}</li>
        <li><strong>Currency:</strong> ${bank_details[0]?.b_currency}</li>
    </ul>
    
<p>Please contact for further details</p>
<p>
Full Name:${user_details[0]?.u_name}<br>
Mobile Number:${user_details[0]?.u_mobile}
    </p>
</body>
</html>
`
        });

        nodemailer.getTestMessageUrl(info);
        await notification.addNotification(user_id, user_details[0].u_role,"Withdrawal Request", "Your Withdrawal request has been submitted & will contact you within 48hrs")
        await sendNotificationToAdmins("Withdraw request",`${user_details[0].u_name} requested to withdraw ${amount}`)
        return res.send({
            result: true,
            message: "Your Withdrawal request has been submitted & will contact you within 48hrs"
        })
    } catch (error) {
        return res.send({
            resulta: false,
            message: error.message
        })
    }
}