var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.ListTopCompany = async (company_id) => {
    let condition = company_id ? ` tc_id=${company_id} and ` : ``;
    let Query = `select * from top_company where ${condition} tc_status='active' `;
    return await query(Query);
}