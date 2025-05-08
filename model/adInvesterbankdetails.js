var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.getAdmin = async (admin_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role =?`;
    var data = await query(Query, [admin_id, admin_role]);
    return data;
};

module.exports.getbank = async (condition) => {
    var Query = `SELECT us.u_id, us.u_name, us.u_email, us.u_mobile, us.u_gender, b.*
    FROM bank b
LEFT JOIN users us ON b.b_u_id = us.u_id ${condition} GROUP BY us.u_id `;

    var data = await query(Query);

    return data;
};