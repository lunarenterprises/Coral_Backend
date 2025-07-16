var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.CheckUserQuery = async (email) => {
    var Query = `select * from users where u_email = ?`;
    var data = query(Query, [email]);
    return data;
};

module.exports.CheckVerificationQuery = async (user_id) => {
    var Query = `select * from user_email_verification where user_email_verification_user_id = ?`;
    var data = query(Query, [user_id]);
    return data;
};

module.exports.InsertVerificationQuery = async (user_id, token) => {
    var Query = `insert into user_email_verification(user_email_verification_user_id,user_email_verification_token)values(?,?)`;
    var data = query(Query, [user_id, token]);
    return data;
};

module.exports.UpdateVerificationQuery = async (user_id, token) => {
    var Query = `update user_email_verification set user_email_verification_token = ? where user_email_verification_user_id = ?`;
    var data = query(Query, [token, user_id]);
    return data;
};


// ============================================================================================================================================================================================================//


module.exports.getVerification = async (user_id, code) => {
    var Query = `select * from user_email_verification where user_email_verification_user_id = ? and user_email_verification_token = ?`;
    var data = query(Query, [user_id, code]);
    return data;
};


// ============================================================================================================================================================================================================//


module.exports.ChangepasswordQuery = async (user_id, password) => {
    var Query = `update users set u_password = ? where u_id = ?`;
    var data = query(Query, [password, user_id]);
    return data;
};


// =============================================================================================================================================================================================================//


module.exports.ChangepinQuery = async (user_id, pin) => {
    var Query = `update users set u_easy_pin = ? where u_id = ?`;
    var data = query(Query, [pin, user_id]);
    return data;
};


module.exports.WfaChangepinQuery = async (user_id, pin) => {
    var Query = `update users set u_wfa_password = ? where u_id = ?`;
    var data = query(Query, [pin, user_id]);
    return data;
};


module.exports.UpdateTokenQuery = async (user_id, token) => {
    let Query=`update users set u_token = ? where u_email = ?`
    return await query(Query, [token, user_id]);
}