var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.ListTopCompany = async () => {
    let Query = `select * from top_company where tc_status='active' `;
    return await query(Query);
}