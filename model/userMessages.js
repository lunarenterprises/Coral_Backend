var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.AdminSendMessage = async (ticket_id, user_id, admin_id, message) => {
    var Query = `insert into messages(ticket_id,user_id,admin_id,message,sendBy)values(?,?,?,?,?)`;
    return await query(Query, [ticket_id, user_id, admin_id, message, "admin"]);;
};

module.exports.UserSendMessage = async (ticket_id, user_id, admin_id, message) => {
    var Query = `insert into messages(ticket_id,user_id,admin_id,message,sendBy)values(?,?,?,?,?)`;
    return await query(Query, [ticket_id, user_id, admin_id, message, "user"]);;
};

module.exports.ListMessages = async (ticket_id) => {
    var Query = `
        SELECT m.*, us.u_name, ad.ad_name 
        FROM messages m
        LEFT JOIN users us ON m.user_id = us.u_id
        LEFT JOIN admin ad ON m.admin_id = ad.ad_id
        WHERE m.ticket_id = ?
    `;
    return await query(Query, [ticket_id]);
}


module.exports.UpdateAdmin = async (user_id, ticket_id, to_admin_id) => {
    var Query = `UPDATE messages 
        SET 
            admin_id = ?
            where user_id = ? and ticket_id=?;
    `;
    return await query(Query, [to_admin_id, user_id, ticket_id])
}