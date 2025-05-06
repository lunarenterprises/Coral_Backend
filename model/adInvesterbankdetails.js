var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.getAdmin = async (admin_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role =?`;
    var data = await query(Query, [admin_id, admin_role]);
    return data;
};

module.exports.getbank = async (condition) => {
    var Query = `SELECT ui.ui_id, ui.ui_date, us.u_id, us.u_name, us.u_email, us.u_mobile, us.u_gender, b.*
FROM user_invest ui
LEFT JOIN users us ON ui.ui_u_id = us.u_id
LEFT JOIN bank b ON us.u_id = b.b_u_id ${condition} GROUP BY us.u_id `;

    var data = await query(Query);

    return data;
};