var db = require('../db/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role ='superadmin'`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
};

module.exports.AddTopCompanyQuery = async (tc_name, tc_current_year, tc_minimum_investment, tc_growth_percentage, tc_expected_CAGR, tc_current_CAGR) => {
    var Query = `insert into top_company (tc_name, tc_current_year, tc_minimum_investment, tc_growth_percentage,tc_expected_CAGR, tc_current_CAGR) values (?,?,?,?,?,?)`;
    var data = query(Query, [tc_name, tc_current_year, tc_minimum_investment, tc_growth_percentage, tc_expected_CAGR, tc_current_CAGR]);
    return data;
}