var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.CheckEmail = async (email) => {
    let Query = `select * from users where u_email=?`
    return await query(Query, [email])
}

module.exports.VerifyOtp = async (email) => {
    let Query = `update users set u_is_registered=? where u_email=?`
    return await query(Query, [1, email])
}