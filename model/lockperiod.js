var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getinvest = async (condition) => {
    var Query = `select * from return_invest ${condition}`;
    var data = await query(Query);
    return data;
};

module.exports.lock = async (u_id, percent, date, amount, duration, project, wf, return_amount, profit_model) => {
    var Query = `insert into lock_period(lp_u_id,lp_percent,lp_date,lp_amount,lp_duration,lp_project,lp_wf,lp_return,lp_profit_model)values(?,?,?,?,?,?,?,?,?)`;
    var data = await query(Query, [u_id, percent, date, amount, duration, project, wf, return_amount, profit_model]);
    return data;
};