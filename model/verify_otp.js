var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.CheckEmail = async (email) => {
    let Query = `select * from users where u_email=? and u_status <> 'removed'`
    return await query(Query, [email])
}

module.exports.VerifyOtp = async (user_id) => {
    let Query = `update users set u_is_registered=? where u_id=?`
    return await query(Query, [1, user_id])
}