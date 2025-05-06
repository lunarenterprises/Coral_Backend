var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role =?`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
}


module.exports.GetNestEggList = async (condition) => {
    var Query = `SELECT ne.*,wl.*, 
    us.u_id, 
    us.u_name, 
    us.u_email, 
    us.u_mobile, 
    us.u_status FROM nestegg ne
    LEFT JOIN users us ON ne.ne_u_id = us.u_id
    LEFT JOIN wallet wl ON ne.ne_u_id = wl.w_u_id ${condition}`;
    var data = await query(Query);
    return data;
}
