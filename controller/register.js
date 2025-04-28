var model = require('../model/register')
var userModel = require('../model/users')
var bcrypt = require("bcrypt");
var moment = require('moment')
var nodemailer = require('nodemailer')

module.exports.UserRegistration = async (req, res) => {
    try {
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

        var date = moment().format("YYYY-MM-DD")

        let { name, email, mobile, currency, password, referralCode } = req.body
        if (!name || !mobile || !email || !password) {
            return res.send({
                result: false,
                message: "insufficient parameters",
            });
        }
        var token = loginToken();
        let checkuser = await model.getUser(email)
        if (checkuser.length > 0) {
            if (checkuser[0]?.u_status == 'active') {
                return res.send({
                    result: false,
                    message: "user already registered ,pls try again with different email"
                });
            } else {
                let user_id = checkuser[0]?.u_id
                await model.UpdateUserQuery1(token, user_id)
                let info = await transporter.sendMail({
                    from: "CORAL WEALTH <coraluae@lunarenp.com>",
                    to: email,
                    subject: 'Verification Otp',
                    html: `<p>Your OTP for registration is <b>${token}</b>. It is valid for 5 minutes.</p>`
                })
                return res.send({
                    status: true,
                    message: "otp send to your mail",
                    token: token
                });
            }
        } else {
            let verifyReferralCode = null
            if (referralCode) {
                verifyReferralCode = await userModel.verifyReferralCode(referralCode)
                if (verifyReferralCode.length == 0 || verifyReferralCode[0].u_id == user_id) {
                    return res.send({
                        result: false,
                        message: "Invalid referral code"
                    })
                }
            }
            let info = await transporter.sendMail({
                from: "CORAL WEALTH <coraluae@lunarenp.com>",
                to: email,
                subject: 'Verification Otp',
                html: `<p>Your OTP for registration is <b>${token}</b>. It is valid for 5 minutes.</p>`
            })
            var hashedPassword = await bcrypt.hash(password, 10);
            let user = await model.InsertUserQuery(name, email, mobile, hashedPassword, date, token, currency, verifyReferralCode);
            return res.send({
                status: true,
                message: "registered successfully,otp send to your mail",
                token: token
            });
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


function loginToken() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}
