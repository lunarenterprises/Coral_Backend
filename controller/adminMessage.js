var model = require('../model/userMessages')
let adminModel = require('../model/adminlogin')
let userModel = require('../model/users')

module.exports.SendMessage = async (req, res) => {
    try {
        let { admin_id, role } = req.user
        let { ticket_id, user_id, message } = req.body
        if (role === "user") {
            return res.send({
                result: false,
                message: "You are not authorised access this"
            })
        }
        if (!ticket_id || !user_id || !admin_id || !message) {
            return res.send({
                result: false,
                message: "Please provide all the required data"
            })
        }
        let data = await model.SendMessage(ticket_id, user_id, admin_id, message)
        if (data.affectedRows == 1) {
            return res.send({
                result: true,
                message: "Message send successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to send messages"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListMessages = async (req, res) => {
    try {
        let { admin_id, role } = req.user
        let { ticket_id, user_id } = req.body
        if (role === 'user') {
            return res.send({
                result: false,
                message: "You are not authorised access this"
            })
        }
        if (!ticket_id || !user_id) {
            return res.send({
                result: false,
                message: "Please provide all the required data"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({
                result: false,
                message: "User not found"
            })
        }
        let messageData = await model.ListMessages(user_id, ticket_id, admin_id)
        if (messageData.length > 0) {
            return res.send({
                result: true,
                message: "Successfully retrived messages",
                data: messageData
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to retrived messages"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.UpdateAdminId = async (req, res) => {
    try {
        let { admin_id, role } = req.user
        let { ticket_id, user_id, to_admin_id } = req.body
        if (role === 'user') {
            return res.send({
                result: false,
                message: "You are not authorised access this"
            })
        }
        if (!ticket_id || !user_id) {
            return res.send({
                result: false,
                message: "Please provide all the required data"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({
                result: false,
                message: "User not found"
            })
        }
        let messageData = await model.UpdateAdmin(user_id, ticket_id, to_admin_id)
        if (messageData.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to update Data"
            })
        }
    } catch (error) {
        res.send({
            result: false,
            message: error.message
        })
    }
}