var model = require('../model/updateLanguage')
let notification = require('../util/saveNotification')
let userModel=require('../model/users')

module.exports.UpdateLanguage = async (req, res) => {
    try {
        let { user_id } = req.user
        let { u_language } = req.body
        if (!u_language || !user_id) {
            return res.send({
                result: false,
                message: "Please provide data"
            })
        }
        let userData=await userModel.getUser(user_id)
        if(userData.length==0){
            return res.send({
                result: false,
                message: "User not found"
            })
        }
        let data = await model.updateLanguage(user_id, u_language)
        if (data.affectedRows == 1) {
            await notification.addNotification(user_id,userData[0].u_role,"Language updated", `Your Language updated to ${u_language}`)
            return res.send({
                result: true,
                message: "Language updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Language not updated"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}