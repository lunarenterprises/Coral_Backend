var model = require('../model/userMessages')
let userModel = require('../model/users')

module.exports.SendMessage = async (req, res) => {
    try {
        let { user_id } = req.headers
        let { ticket_id, admin_id, message } = req.body
        if (!ticket_id || !user_id || !message) {
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
        let data = await model.SendMessage(ticket_id, user_id, admin_id, message)
        if (data.affectedRows == 1) {
            return res.send({
                result: true,
                message: "Message Send successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to sent message"
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
        let { user_id } = req.headers
        let { ticket_id, admin_id } = req.body
        if (!ticket_id || !user_id ) {
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
        let messageData = await model.ListMessages(user_id, ticket_id)
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
            message: "Failed to fetch messages"
        })
    }
}