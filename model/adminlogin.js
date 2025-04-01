var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.CheckUserQuery = async (email) => {
    var Query = `SELECT * FROM users WHERE u_email = ? AND u_role <> 'user' `;
    var data = query(Query, [email]);
    return data;
};

module.exports.CheckUserAppsQuery = async (user_id, device_id, device_os) => {
    var Query = `select * from user_apps where user_apps_user_id = ? and user_apps_device_id = ? and user_apps_device_os = ?`;
    var data = query(Query, [user_id, device_id, device_os]);
    return data;
};

module.exports.UpdateUserAppsQuery = async (
    device_token,
    api_key,
    fcm_token,
    app_version,
    user_apps_id
) => {
    let appVersion = '';
    let appVers = '';
    if (app_version) {
        appVersion = `,user_apps_version`
        appVers = `='${app_version}'`
    }
    var Query = `update user_apps set user_apps_device_token = ?,user_apps_key = ?,fcm_token=?${appVersion}${appVers} where user_apps_id = ?`;
    var data = query(Query, [
        device_token,
        api_key,
        fcm_token,
        user_apps_id,
    ]);
    return data;
};

module.exports.InsertUserAppsQuery = async (
    device_id,
    device_os,
    device_token,
    user_id,
    api_key,
    fcm_token,
    app_version
) => {
    let appVersion = '';
    let appVers = '';
    if (app_version) {
        appVersion = `,user_apps_version`
        appVers = `,'${app_version}'`
    }
    var Query = `insert into user_apps(user_apps_user_id,user_apps_device_token,user_apps_device_id,user_apps_device_os,user_apps_key,fcm_token${appVersion})values(?,?,?,?,?,?${appVers})`;
    var data = query(Query, [user_id, device_token, device_id, device_os, fcm_token, api_key]);
    return data;
};

module.exports.getrank = async (r_id) => {
    var Query = `select * from rank where r_id =?`;
    var data = query(Query, [r_id]);
    return data;
};