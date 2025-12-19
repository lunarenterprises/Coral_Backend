var model = require('../model/users')
var referralModel = require('../model/referralBonus')
var notification = require('../util/saveNotification')


module.exports.AddReferral = async (req, res) => {
    try {
        var { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "user_id is required"
            })
        }
        let { referralCode } = req.body
        if (!referralCode) {
            return res.send({
                result: false,
                message: "referralCode is required"
            })
        }
        var userData = await model.getUser(user_id)
        if (userData[0].u_referredCode) {
            return res.send({
                result: false,
                message: "Referral code already added"
            })
        }
        let verifyReferralCode = await model.verifyReferralCode(referralCode)
        if (verifyReferralCode.length == 0 || verifyReferralCode[0].u_id == user_id) {
            return res.send({
                result: false,
                message: "Invalid referral code"
            })
        }
        let updatedData = await model.addReferralCode(user_id, referralCode)
        if (updatedData.affectedRows > 0) {
            await referralModel.addReferralBonus(verifyReferralCode[0].u_id, user_id)
            await notification.addNotification(user_id,userData[0].u_role, "Referral code added", "Referral code added successfully")
            return res.send({
                result: true,
                message: "Referral code added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add referral code"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

