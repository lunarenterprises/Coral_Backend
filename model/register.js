var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getUser = async (email) => {
    var Query = `select * from users where u_email = ? and u_status <> 'removed'`;
    var data = await query(Query, [email]);
    return data;
};


module.exports.CheckUserQuery = async (email) => {
    var Query = `select * from users
    where u_email = ?`;
    var data = await query(Query, [email]);
    return data;
};


module.exports.checkIfExists = async () => {
    var Query = `SELECT u_referal_id FROM users order by  u_id desc limit 1`;
    var data = await query(Query);
    return data;
};


module.exports.CheckVerificationQuery = async (user_id) => {
    var Query = `select * from user_email_verification where user_email_verification_user_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.InsertVerificationQuery = async (user_id, token) => {
    var Query = `insert into user_email_verification(user_email_verification_user_id,user_email_verification_token)values(?,?)`;
    var data = await query(Query, [user_id, token]);
    return data;
};

module.exports.UpdateVerificationQuery = async (user_id, token) => {
    var Query = `update user_email_verification set user_email_verification_token = ? where user_email_verification_user_id = ?`;
    var data = await query(Query, [token, user_id]);
    return data;
};

module.exports.InsertUserQuery = async (name, email, mobile, hashedPassword, date, token, currency, referralCode, refferedUserId) => {
    var Query = `insert into users(u_name,u_email,u_mobile,u_password,u_joining_date,u_token,u_currency,u_referralCode,u_referredCode)values(?,?,?,?,?,?,?,?,?)`;
    var data = await query(Query, [name, email, mobile, hashedPassword, date, token, currency, referralCode, refferedUserId]);
    return data;
};

module.exports.UpdateUserQuery1 = async (token, u_id) => {
    var Query = `update users set u_token = ? where u_id = ?`;
    var data = await query(Query, [token, u_id]);
    return data;
};

module.exports.UpdateUserQuery = async (name, email, password) => {
    var Query = `update users set u_first_name = ?,u_password = ? where u_email = ?`;
    var data = await query(Query, [name, password, email]);
    return data;
};

module.exports.CheckUserlist = async (user_id) => {
    var Query = `select u_id,u_referal_id,u_master_id,u_income,u_daily_income,u_rank,u_level from users where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.CheckUserlevel = async (master_id) => {
    var Query = `select u_level from users where u_master_id = ? order by u_level desc limit 1`;
    var data = await query(Query, [master_id]);
    return data;
};


module.exports.updateUserChild = async (user_id) => {
    var Query = `update users set u_income = u_income + 20,u_level + 1 where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.updateUserParent = async (user_id) => {
    var Query = `update users set u_income = u_income + 40,u_level + 1 where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.UpdateOtp = async (email, otp) => {
    let Query = `update users set u_token = ? where u_email = ?`;
    return await query(Query, [otp, email]);
}