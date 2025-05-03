var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getinvest = async (condition) => {
    var Query = `SELECT lp.*, us.u_name FROM lock_period lp LEFT JOIN users us ON lp.lp_u_id = us.u_id ${condition}`;
    var data = await query(Query);
    return data;
};