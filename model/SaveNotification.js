var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.createNotification = async (user_id, userRole, type, message, status = 'unread') => {
    var Query = `INSERT INTO notifications (user_id,role, type, message, status)
        VALUES (?, ?, ?, ?,?)`;
    var data = await query(Query, [user_id, userRole, type, message, status]);
    return data;
};