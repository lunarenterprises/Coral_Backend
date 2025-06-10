const model = require('../model/verify_otp')


module.exports.VerifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body
        if (!email || !otp) {
            return res.send({
                result: false,
                message: "Email and otp are required"
            })
        }
        let checkEmail = await model.CheckEmail(email)
        if (checkEmail.length === 0) {
            return res.send({
                result: false,
                message: "Email not found."
            })
        }
        let otpInDb = checkEmail[0]?.u_token
        if (otpInDb != otp) {
            return res.send({
                result: false,
                message: "Invalid otp"
            })
        } else {
            await model.VerifyOtp(email)
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