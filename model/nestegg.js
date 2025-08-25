var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.checkwfa = async (user_id, wfa_password) => {
    var Query = `select * from users where u_id = ? and u_wfa_password = ?`;
    var data = await query(Query, [user_id, wfa_password]);
    return data;
};

module.exports.AddNest = async (ne_amount, ne_duration, ne_u_id, ne_date) => {
    var Query = `insert into nestegg(ne_amount,ne_duration,ne_u_id,ne_start_date)values(?,?,?,?)`;
    var data = await query(Query, [ne_amount, ne_duration, ne_u_id, ne_date]);
    return data;
};

module.exports.UpdateUser = async (user_id, amount) => {
    var Query = `update users set u_wallet = u_wallet-${amount} where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};