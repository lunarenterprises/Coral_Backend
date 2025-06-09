var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.GetIndustryGrowth = async (industry_id) => {
    let Query = `select * from industries_growth where ig_industries_id = ?`
    return await query(Query, [industry_id])
}