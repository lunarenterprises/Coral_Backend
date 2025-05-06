var db = require("../db/db");
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role =?`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
}

module.exports.CheckTopCompanyQuery = async (tc_id) => {
    var Query = `select * from top_company where tc_id= ?`;
    var data = query(Query, [tc_id]);
    return data;
};

module.exports.ChangeTopCompany = async (condition, tc_id) => {
    var Query = `update top_company ${condition} where tc_id = ?`;
    var data = query(Query, [tc_id]);
    return data;
};

