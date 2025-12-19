var model = require('../model/ticket')
let userModel = require('../model/users')
let notification = require('../util/saveNotification')
let { sendNotificationToAdmins } = require('../util/firebaseConfig')

module.exports.CreateTicket = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let { category } = req.body
        if (!category) {
            return res.send({ result: false, message: "Category is required" })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({ result: false, message: "User not found" })
        }
        let ticket = await model.createTicket(user_id, `Requested to ${category}`, category)
        if (ticket.affectedRows > 0) {
            let userName = userData[0]?.u_name
            await sendNotificationToAdmins(category, `${userName} requested to ${category}`)
            await notification.addNotification(user_id, userData[0].u_role, `Ticket for ${category}`, `Your requested to ${category} has been send to the admin!.`)
            return res.send({
                result: true,
                message: "Ticket created successfully",
                ticket_id: ticket.insertId
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to create ticket"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListTickets = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({ result: false, message: "User not found" })
        }
        let ticketList = await model.listTickets(user_id)
        if (ticketList.length > 0) {
            return res.send({
                result: true,
                message: "Data retrived successfully",
                data: ticketList
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to retrieve data"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.EditTicket = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let { purpose, category, ticket_id } = req.body
        if (!ticket_id) {
            return res.send({
                result: false,
                message: "Ticket id is required"
            })
        }
        if (!purpose || !category) {
            return res.send({ result: false, message: "Please fill all the fields" })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({ result: false, message: "User not found" })
        }
        let ticketData = await model.getTicket(ticket_id)
        if (ticketData.length === 0) {
            return res.send({
                result: false,
                message: "Ticket Not found"
            })
        }
        let updatedTicket = await model.updateTicket(ticket_id, user_id, purpose, category)
        if (updatedTicket.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Updated ticket successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to update ticket"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteTicket = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let { ticket_id } = req.body
        if (!ticket_id) {
            return res.send({
                result: false,
                message: "Ticket id is required"
            })
        }
        let deletedData = await model.deleteTicket(ticket_id, user_id)
        if (deletedData.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Deleted ticket successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete ticket"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}