var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.Getwallet = async (user_id) => {
    var Query = `select * from wallet where w_u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};


module.exports.GetUser = async (user_id) => {
    let Query = `select * from users where u_id=?`
    return await query(Query, [user_id])
}