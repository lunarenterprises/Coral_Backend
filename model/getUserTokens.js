var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getUserToken = async (user_id) => {
    var Query = `select fcm_token from user_apps where user_apps_user_id=? and fcm_token IS NOT NULL;`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.getAdminTokens = async () => {
    var Query = `SELECT u.u_id, ua.fcm_token
FROM users u
INNER JOIN user_apps ua ON u.u_id = ua.user_apps_user_id
WHERE u.u_role <> 'user' AND ua.fcm_token IS NOT NULL`
    return await query(Query)
}