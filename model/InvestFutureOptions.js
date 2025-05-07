var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.CheckLockData = async (lock_id, user_id) => {
    let Query = `select * from lock_period where lp_id=? and lp_u_id=?`
    return await query(Query, [lock_id, user_id])
}