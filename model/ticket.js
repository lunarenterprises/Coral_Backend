var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.createTicket = async (user_id, purpose, category) => {
    var Query = `insert into tickets(user_id,purpose,category)values(?,?,?)`;
    var data = await query(Query, [user_id, purpose, category]);
    return data;
};

module.exports.listTickets = async (user_id) => {
    var Query = `select * from tickets where user_id=? ORDER BY createdAt DESC`
    return await query(Query, [user_id])
}

module.exports.getTicket = async (ticket_id, user_id) => {
    var Query = `select * from tickets where id=? and user_id=?`
    return await query(Query, [ticket_id, user_id])
}

module.exports.updateTicket = async (ticket_id, user_id, purpose, category) => {
    var Query = `update tickets set purpose=?, category=? where ticket_id=? and user_id=?`
    return await query(Query, [purpose, category, ticket_id, user_id])
}

module.exports.deleteTicket = async (ticket_id, user_id) => {
    var Query = `delete from tickets where id=? and user_id=?`
    return await query(Query, [ticket_id, user_id])
}