let ticketModel = require('../model/adminTickets')
var adminModel = require('../model/adminlist')

module.exports.ListAllTickets = async (req, res) => {
    try {
        let { admin_id, role } = req.user
        let adminData = await adminModel.CheckAdmin(admin_id, role)
        if (adminData.length == 0 || adminData[0]?.u_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        let tickets = await ticketModel.getAllTickets()
        if (tickets.length > 0) {
            return res.send({
                result: true,
                message: "Data retrieved successfully",
                data: tickets
            })
        } else {
            return res.send({
                result: false,
                message: "No data found"
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
        let { admin_id, role } = req.user
        let adminData = await adminModel.CheckAdmin(admin_id, role)
        if (adminData.length == 0 || adminData[0]?.u_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }
        let { ticket_id, status } = req.body
        if (!ticket_id || !status) {
            return res.send({
                result: false,
                message: "Ticket id and status is required"
            })
        }
        let updatedData = await ticketModel.updateStatus(ticket_id, status)
        if (updatedData.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Status updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to update status"
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
        let { admin_id, role } = req.user
        let adminData = await adminModel.CheckAdmin(admin_id, role)
        if (adminData.length == 0 || adminData[0]?.u_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }
        let { ticket_id } = req.body
        if (!ticket_id) {
            return res.send({
                result: false,
                message: "Ticket id is required"
            })
        }
        let deletedData = await ticketModel.deleteTicket(ticket_id)
        if (deletedData.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Deleted ticket Successfully"
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