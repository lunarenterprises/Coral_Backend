var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.GetFutureInvestmentList = async (fi_id) => {
    let condition = ''
    if (fi_id) {
        condition = `where fi_id ='${fi_id}'`

    }
    var Query = `select * from future_investments ${condition}`;
    var data = await query(Query);
    return data;
};


module.exports.getAdmin = async (user_id) => {
    var Query = `select * from users where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};


module.exports.AddFutureInvestmentQuery = async (fi_industries, fi_plan_to_invest, fi_expected_return, fi_minimum_investment) => {
    var Query = `insert into future_investments (fi_industries, fi_plan_to_invest, fi_expected_return, fi_minimum_investment) values (?,?,?,?)`;
    var data = query(Query, [fi_industries, fi_plan_to_invest, fi_expected_return, fi_minimum_investment]);
    return data;
}

module.exports.ChangeFutureInvestment = async (condition, fi_id) => {
    var Query = `update future_investments ${condition} where fi_id = ?`;
    var data = query(Query, [fi_id]);
    return data;
};