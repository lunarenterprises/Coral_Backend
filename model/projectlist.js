var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getCompanyInvest = async () => {
    var Query = `SELECT ri_project AS ci_industry, MIN(ri_amount_from) AS min_amount_from, MAX(ri_amount_to) AS max_amount_to, MIN(ri_return_year) AS earliest_return_year FROM return_invest GROUP BY ri_project ORDER BY min_amount_from ASC`;
    var data = await query(Query);
    return data;
};