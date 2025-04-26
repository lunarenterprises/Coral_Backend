var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from users where u_id = ? and u_role =?`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
};


module.exports.GetUserWithdraw = async (condition) => {
    var Query = `SELECT wr.*,b.*, 
    uk.uk_bank_statement
    us.u_id, 
    us.u_name, 
    us.u_email, 
    us.u_mobile, 
    us.u_status FROM withdraw_request wr
    LEFT JOIN users us ON wr.wr_u_id = us.u_id
    LEFT JOIN user_kyc uk ON wr.wr_u_id = uk.uk_u_id
    LEFT JOIN bank b ON b.b_u_id = wr.wr_u_id where wr.wr_action_status ='active' ${condition}`;
    var data = await query(Query);
    return data;
}

