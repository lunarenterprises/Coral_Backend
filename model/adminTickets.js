var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getAllTickets = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    var Query = `
        SELECT tickets.*, users.*
        FROM tickets
        INNER JOIN users ON tickets.user_id = users.u_id
        ORDER BY tickets.createdAt DESC
        LIMIT ? OFFSET ?
    `;
    return await query(Query, [limit, offset]);
};

module.exports.updateStatus = async (ticket_id, status, assigned_to, assigned_staff) => {
    var Query = `update tickets set status=?,assigned_to=?,assigned_staff=? where id=?`
    return await query(Query, [status, , assigned_to, assigned_staff, ticket_id])
}

module.exports.deleteTicket = async (ticket_id) => {
    var deleteMessagesQuery = `DELETE FROM messages WHERE ticket_id = ?`;
    await query(deleteMessagesQuery, [ticket_id]);

    // Now, delete the ticket
    var deleteTicketQuery = `DELETE FROM tickets WHERE id = ?`;
    return await query(deleteTicketQuery, [ticket_id]);
}