let ticketModel = require('../model/adminTickets')
var adminModel = require('../model/adminlist')

module.exports.ListAllTickets = async (req, res) => {
    try {
        let { admin_id, role } = req.user
        let adminData = await adminModel.CheckAdmin(admin_id, role)
        if (adminData.length == 0 || adminData[0]?.ad_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }
        // Get the page and limit parameters from the request query
        let page = parseInt(req.query.page) || 1;   // Default to page 1 if not provided
        let limit = parseInt(req.query.limit) || 5; // Default to 10 records per page

        let tickets = await ticketModel.getAllTickets(page, limit)
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
        if (adminData.length == 0 || adminData[0]?.ad_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }
        let { ticket_id, status, assigned_to } = req.body
        if (!ticket_id || !status || !assigned_to) {
            return res.send({
                result: false,
                message: "Ticket id, Status and Staff Id is required"
            })
        }
        let checkStaff = await ticketModel.CheckStaff(assigned_to)
        let assigned_staff = checkStaff[0]?.u_name
        let updatedData = await ticketModel.updateStatus(ticket_id, status, assigned_to, assigned_staff)
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
        if (adminData.length == 0 || adminData[0]?.ad_role == 'user') {
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