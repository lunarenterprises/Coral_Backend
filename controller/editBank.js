var model = require('../model/editBank')
const notification=require('../util/saveNotification')
let userModel=require('../model/users')


module.exports.EditBank = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({ result: false, message: "User id not found" })
        }
        let { b_id, b_account_no, b_ifsc_code, b_swift_code, b_name, b_branch_name, b_currency, b_name_as } = req.body
        if (!b_id || !b_account_no || !b_ifsc_code || !b_name || !b_name_as) {
            return res.send({ result: false, message: "Please fill all the fields" })
        }
        let bankData = await model.findBank(b_id, user_id)
        if (bankData.length == 0) {
            return res.send({ result: false, message: "Bank not found" })
        }
        let userData=await userModel.getUser(user_id)
        if(userData.length==0){
            return res.send({result:false,message:"User not found"})
        }
        let update = await model.EditBank(b_id, b_account_no, b_ifsc_code, b_swift_code, b_name, b_branch_name, b_currency, b_name_as)
        if (update.affectedRows > 0) {
            await notification.addNotification(user_id,userData[0].u_role, "Bank updated", "Bank details updated successfully")
            return res.send({
                result: true,
                message: "updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "failed to update"
            })
        }
    } catch (error) {
        console.error(error)
        return res.send({
            result: false,
            message: error.message
        })
    }
}