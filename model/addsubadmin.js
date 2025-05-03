var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role ='superadmin'`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
};

module.exports.AddAdmin = async (name, email, password, mobile, u_profile_pic, date, role, u_access) => {
    var Query = `insert into users (ad_name,ad_email,ad_password,ad_phone,ad_profile_pic,ad_join_date,ad_role,ad_access) values (?,?,?,?,?,?,?,?)`;
    var data = await query(Query, [name, email, password, mobile, u_profile_pic, date, role, u_access]);
    return data;
};