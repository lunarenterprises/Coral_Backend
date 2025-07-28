const model = require('../model/verify_otp')
const moment = require('moment')


module.exports.VerifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body
        if (!email || !otp) {
            return res.send({
                result: false,
                message: "Email and otp are required"
            })
        }
        email = email.toLowerCase().trim()
        let checkEmail = await model.CheckEmail(email)
        if (checkEmail.length === 0) {
            return res.send({
                result: false,
                message: "Email not found."
            })
        }
        let otpInDb = checkEmail[0]?.u_token
        let now = moment(); // current time without formatting
        let tokenTime = moment(checkEmail[0]?.u_token_expiry, 'YYYY-MM-DD HH:mm:ss');
        if (now.isAfter(tokenTime)) {
            return res.send({
                result:false,
                message:"Token has expired. Try new one."
            })
        }
        if (otpInDb != otp) {
            return res.send({
                result: false,
                message: "Invalid otp"
            })
        } else {
            await model.VerifyOtp(checkEmail[0]?.u_id)
        }
        return res.send({
            result: true,
            message: "OTP Verification successfull."
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}