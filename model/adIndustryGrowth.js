var db = require('../db/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role ='superadmin'`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
};

module.exports.AddIndustryGrowthQuery = async (ig_industries_id,ig_year,ig_growths) => {
    var Query = `insert into industries_growth (ig_industries_id,ig_year,ig_growths) values (?,?,?)`;
    var data = query(Query, [ig_industries_id,ig_year,ig_growths]);
    return data;
}

module.exports.getIndustryGrowthList = async (industry_id) => {
    var Query = `select * from industries_growth where ig_industries_id = ? `;
    var data = await query(Query, [industry_id]);
    return data;
};