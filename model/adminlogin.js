var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.CheckUserQuery = async (email) => {
    var Query = `SELECT * FROM admin WHERE ad_email = ? `;
    var data = query(Query, [email]);
    return data;
};

module.exports.CheckUserAppsQuery = async (user_id, device_os) => {
    var Query = `select * from user_apps where user_apps_admin_id = ? and user_apps_device_os = ?`;
    var data = query(Query, [user_id, device_os]);
    return data;
};

module.exports.UpdateUserAppsQuery = async (fcm_token, user_apps_id) => {
    var Query = `update user_apps set fcm_token=? where user_apps_id = ?`;
    var data = query(Query, [fcm_token, user_apps_id]);
    return data;
};

module.exports.InsertUserAppsQuery = async (device_os, user_id, fcm_token,) => {
    var Query = `insert into user_apps(user_apps_admin_id,user_apps_device_os,fcm_token)values(?,?,?)`;
    var data = query(Query, [user_id, device_os, fcm_token]);
    return data;
};

// module.exports.getrank = async (r_id) => {
//     var Query = `select * from rank where r_id =?`;
//     var data = query(Query, [r_id]);
//     return data;
// };