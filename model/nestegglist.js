var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.GetNestegg = async (user_id) => {
    var Query = `select * from nestegg
    left join wallet on ne_wallet = w_id where w_u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};


module.exports.Getbalance = async (user_id) => {
    var Query = `select u_returned_amount,u_wallet from users where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.Getwallet = async (user_id) => {
    var Query = `select * from wallet where w_u_id = ? order by w_id desc limit 2`;
    var data = await query(Query, [user_id]);
    return data;
};