var nodemailer = require("nodemailer");
var randtoken = require("rand-token").generator({
    chars: "0123456789",
});
var moment = require('moment')
var model = require("../model/forgotpassword");
var bcrypt = require('bcrypt')

let notification = require('../util/saveNotification')

module.exports.OtpSend = async (req, res) => {
    try {
        let { email } = req.body;
        console.log("email : ", email)
        var year = moment().format("YYYY")
        if (!email) {
            return res.send({
                result: false,
                message: "insufficient parameters",
            });
        }
        email = email.toLowerCase().trim()
        let CheckUser = await model.CheckUserQuery(email);
        var token = randtoken.generate(4);
        const tokenExpiry = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');

        if (CheckUser.length > 0) {
            let user_id = CheckUser[0].u_id
            let CheckVerificationCode = await model.CheckVerificationQuery(
                user_id
            );
            if (CheckVerificationCode.length > 0) {
                await model.UpdateVerificationQuery(user_id, token, tokenExpiry);
            } else {
                await model.InsertVerificationQuery(user_id, token, tokenExpiry);
            }
            let tokenUpdated = await model.UpdateTokenQuery(user_id, token, tokenExpiry);
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
                to: email,
                subject: "Your single-use code",
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Single-Use Code for CORAL WEALTH Account</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4CAF50;
            color: #ffffff;
            padding: 10px 0;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CORAL WEALTH</h1>
        </div>
        <div class="content">
            <p>We received your request for a single-use code to use with your CORAL WEALTH account.</p>
            <p>Your single-use code is: <strong>${token}</strong></p>
            <p>If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
            <p>Thanks,<br>CORAL WEALTH Account Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${year} CORAL WEALTH. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
            });
            nodemailer.getTestMessageUrl(info);
            return res.send({
                status: true,
                message: "verification code sent to your mail",
                token: token
            });
        } else {
            return res.send({
                result: false,
                message: "email verification not done",
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

module.exports.Emailverification = async (req, res) => {
    let { email, code } = req.body

    if (!email || !code) {
        return res.send({
            result: false,
            message: "insufficient parameters"
        })
    }
    email = email.toLowerCase().trim()
    let checkuser = await model.CheckUserQuery(email)
    if (checkuser.length > 0) {
        let user_id = checkuser[0].user_email_verification_user_id
        let now = moment(); // current time without formatting
        let tokenTime = moment(checkuser[0]?.user_token_expiry, 'YYYY-MM-DD HH:mm:ss');
        if (now.isAfter(tokenTime)) {
            return res.send({
                result: false,
                message: "Token has expired. Try new one."
            })
        }
        if (checkuser[0]?.user_email_verification_token != code) {
            return res.send({
                result: false,
                message: "Invalid token. Please try again later"
            })
        }
        await notification.addNotification(user_id, checkuser[0].u_role, "Email Verified", "Your email has been verified successfully")
        return res.send({
            result: true,
            message: "code successfully verified"
        })
    } else {
        return res.send({
            result: false,
            message: "user not found"
        })
    }
}

module.exports.ChangePassword = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.send({
                result: false,
                message: "insufficient parameters",
            });
        }
        email = email.toLowerCase().trim()
        let CheckUser = await model.CheckUserQuery(email);
        if (CheckUser.length > 0) {
            let user_id = CheckUser[0].u_id
            var hashedPassword = await bcrypt.hash(password, 10);
            await model.ChangepasswordQuery(
                user_id,
                hashedPassword
            );
            await notification.addNotification(user_id, CheckUser[0].u_role, "Password Changed", "Your password has been changed successfully")
            return res.send({
                result: true,
                message: "password has been changed successfully",
            });
        } else {
            return res.send({
                result: false,
                message: "user does not exist",
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

module.exports.ChangePin = async (req, res) => {
    try {
        let { email, pin } = req.body;
        if (!email || !pin) {
            return res.send({
                result: false,
                message: "insufficient parameters",
            });
        }
        email = email.toLowerCase().trim()
        let CheckUser = await model.CheckUserQuery(email);
        if (CheckUser.length > 0) {
            let user_id = CheckUser[0].u_id
            await model.ChangepinQuery(
                user_id,
                pin
            );
            await notification.addNotification(user_id, CheckUser[0].u_role, "Pin Changed", "Your pin has been changed successfully")
            return res.send({
                result: true,
                message: "pin has been changed successfully",
            });
        } else {
            return res.send({
                result: false,
                message: "user does not exist",
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });
    }
};



module.exports.WfaChangePin = async (req, res) => {
    try {
        let { email, pin } = req.body;
        if (!email || !pin) {
            return res.send({
                result: false,
                message: "insufficient parameters",
            });
        }
        email = email.toLowerCase().trim()
        let CheckUser = await model.CheckUserQuery(email);
        if (CheckUser.length > 0) {
            let user_id = CheckUser[0].u_id
            await model.WfaChangepinQuery(
                user_id,
                pin
            );
            await notification.addNotification(user_id, CheckUser[0].u_role, "Pin Changed", "Your pin has been changed successfully")
            return res.send({
                result: true,
                message: "pin has been changed successfully",
            });
        } else {
            return res.send({
                result: false,
                message: "user does not exist",
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });
    }
};