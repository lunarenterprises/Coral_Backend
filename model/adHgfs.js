var db = require('../db/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.getAdmin = async (user_id) => {
    var Query = `select * from admin where ad_id = ? `;
    var data = await query(Query, [user_id]);
    return data;
}


module.exports.AddHGFSQuery = async (h_industry, h_previous_years, h_last_year, h_growth) => {
    var Query = `insert into hgfs (h_industry, h_previous_years, h_last_year, h_growth) values (?,?,?,?)`;
    var data = query(Query, [h_industry, h_previous_years, h_last_year, h_growth]);
    return data;
}

module.exports.GetHgfs = async (h_id) => {
    let condition = ''
    if (h_id) {
        condition = `and h_id = '${h_id}'`
    }
    var Query = `select * from hgfs where h_status='active' ${condition}`;
    var data = await query(Query);
    return data;
};

module.exports.Getbalance = async (user_id) => {
    var Query = `select u_returned_amount,u_status,u_kyc,u_currency from users where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.GetUserInvest = async (user_id) => {
    var Query = `select * from user_invest where ui_u_id = ? and ui_security_option = 'Shares'`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.ChangeHGFS = async (condition, h_id) => {
    var Query = `update hgfs ${condition} where h_id = ?`;
    var data = query(Query, [h_id]);
    return data;
};
