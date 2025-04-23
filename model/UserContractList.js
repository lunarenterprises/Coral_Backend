var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.GetUserContractList = async (user_id) => {
    // First, update the ui_status to 'completed' where ui_duration is before the current date
    var updateQuery = `
        UPDATE user_invest
        SET ui_status = 'completed'
        WHERE ui_u_id = ? AND ui_duration < CURDATE() AND ui_status != 'completed';
    `;
    await query(updateQuery, [user_id]);

    // Then fetch the updated contract list
    var Query = `
        SELECT 
    u.*, 
    n.*
    FROM 
    nominee n
    JOIN 
    users u ON n.n_u_id = u.u_id
    WHERE 
    n.n_u_id = ?;
    `;
    var data = await query(Query, [user_id]);

    return data;
};


module.exports.GetUserWithdraw = async (user_id) => {
    var Query = `select * from withdraw_request where wr_u_id=? `;
    var data = await query(Query, [user_id]);
    return data;
}