var db = require('../db/db')
var util = require('util')
var query = util.promisify(db.query).bind(db)

module.exports.getAdmin = async (user_id, role) => {
    var Query = `select * from users where u_id =? and u_role =?`;
    var data = await query(Query, [user_id, role]);
    return data;
}

module.exports.getPayoutHistory = async (condition) => {
    var Query = `SELECT payout_history.*, users.u_name FROM payout_history INNER JOIN users
    ON payout_history.ph_invest_u_id = users.u_id ${condition}`;
    var data = await query(Query);
    return data;
}


module.exports.ChangepayoutDataQuery = async (condition, payout_id) => {
    var Query = `update payout_history ${condition} where ph_id = ?`;
    var data = query(Query, [payout_id]);
    return data;
};

module.exports.CheckpayoutDataQuery = async (payout_id) => {
    var Query = `SELECT  * FROM payout_history WHERE ph_id = ? `;
    var data = await query(Query, [payout_id]);
    return data;
}