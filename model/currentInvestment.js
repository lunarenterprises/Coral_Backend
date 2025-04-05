var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getInvestedData = async (u_id) => {
    var Query = `select * from user_invest where ui_u_id = ? and ui_status = 'active'`;
    var data = await query(Query, [u_id]);
    return data;
}

module.exports.getCWIIvestments = async () => {
    var Query = `select * from top_company`
    var data = await query(Query);
    return data;
}