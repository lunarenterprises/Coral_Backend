var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.AdminSendMessage = async (ticket_id, user_id, admin_id, message) => {
    var Query = `insert into messages(ticket_id,user_id,admin_id,message,sendBy)values(?,?,?,?,?)`;
    return await query(Query, [ticket_id, user_id, admin_id, message, admin_id]);;
};

module.exports.UserSendMessage = async (ticket_id, user_id, admin_id, message) => {
    var Query = `insert into messages(ticket_id,user_id,admin_id,message,sendBy)values(?,?,?,?,?)`;
    return await query(Query, [ticket_id, user_id, admin_id, message, user_id]);;
};

module.exports.ListMessages = async (ticket_id) => {
    var Query = `select * from messages where ticket_id=?`
    return await query(Query, [ticket_id])
}

module.exports.UpdateAdmin = async (user_id, ticket_id, to_admin_id) => {
    var Query = `UPDATE messages 
        SET 
            admin_id = ?
            where user_id = ? and ticket_id=?;
    `;
    return await query(Query, [to_admin_id, user_id, ticket_id])
}