var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.ListTopcompanyquery = async (condition) => {
    var Query = `select * from top_company where tc_status='active' ${condition} `;
    var data = await query(Query);
    return data;
};

