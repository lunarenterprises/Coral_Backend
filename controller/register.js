var model = require('../model/register')
var userModel = require('../model/users')
var bcrypt = require("bcrypt");
var moment = require('moment')
var nodemailer = require('nodemailer')
const { generateUniqueReferralCode } = require('../util/generateReferralCode')

module.exports.UserRegistration = async (req, res) => {
  try {
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

    var date = moment().format("YYYY-MM-DD")

    let { name, email, mobile, currency, password, referralCode } = req.body
    if (!name || !mobile || !email || !password) {
      return res.send({
        result: false,
        message: "insufficient parameters",
      });
    }
    email = email.toLowerCase().trim()
    const token = loginToken();
    const tokenExpiry = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    let checkuser = await model.getUser(email)
    if (checkuser.length > 0 && checkuser[0].u_is_registered == 1) {
      console.log("User already registered with this email:", email);
      return res.send({
        result: false,
        message: "User already registered with this email."
      })
    } else {
      let refferedUserId = null
      if (referralCode) {
        const verifyReferralCode = await userModel.verifyReferralCode(referralCode)
        if (verifyReferralCode.length == 0 || verifyReferralCode[0].u_id == user_id) {
          return res.send({
            result: false,
            message: "Invalid referral code"
          })
        }
        refferedUserId = verifyReferralCode[0]?.u_id
      }
      let info = await transporter.sendMail({
        from: "CORAL WEALTH <nocontact@lunarenp.com>",
        to: email,
        subject: 'Verification Otp',
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your OTP Code</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="20" cellspacing="0" style="background-color: #ffffff; margin-top: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="font-size: 24px; font-weight: bold; color: #333333;">
              Your One-Time Password (OTP)
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 18px; color: #555555;">
              Hello ${name},
              <br><br>
              Your OTP for verification is:
            </td>
          </tr>
          <tr>
            <td align="center">
              <div style="font-size: 32px; font-weight: bold; color: #007BFF; margin: 20px 0;">
                ${token}
              </div>
              <div style="font-size: 14px; color: #777777;">
                This code will expire in 10 minutes and can only be used once.
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 14px; color: #999999; padding-top: 30px;">
              If you did not request this code, please ignore this email or contact support.
              <br><br>
              — Coral Investment Team
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
      })
      var hashedPassword = await bcrypt.hash(password, 10);
      if (checkuser.length > 0 && checkuser[0].u_is_registered == 0) {
        console.log("User already exists, updating OTP for user:", email);
        // Update existing user
        await model.UpdateOtp(email, token, tokenExpiry);

      } else {
        const referralCode = await generateUniqueReferralCode(4)
        console.log("referralCode : ", referralCode)
        await model.InsertUserQuery(name, email, mobile, hashedPassword, date, token, tokenExpiry, currency, referralCode, refferedUserId);
      }
      return res.send({
        status: true,
        message: "registered successfully,otp send to your mail"
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
