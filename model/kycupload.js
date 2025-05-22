var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.AddUserKyc = async (u_id, id_type, front_page, back_page, bank_file) => {
    var Query = `insert into user_kyc(uk_u_id,uk_id_type,uk_front,uk_back,uk_bank_statement)values(?,?,?,?,?)`;
    var data = await query(Query, [u_id, id_type, front_page, back_page, bank_file]);
    return data;
};

module.exports.GetUser = async (u_id) => {
    var Query = `select * from users where u_id = ?`;
    var data = await query(Query, [u_id]);
    return data;
};

module.exports.GetUserKyc = async (u_id) => {
    var Query = `select * from user_kyc where uk_u_id = ?`;
    var data = await query(Query, [u_id]);
    return data;
};

module.exports.UpdateUser = async (profile, u_wfa_password, u_id, dob) => {
    var Query = `update users set u_profile_pic = ?,u_wfa_password = ?,u_dob = ? where u_id = ?`;
    var data = await query(Query, [profile, u_wfa_password, dob, u_id]);
    return data;
};

module.exports.Addbank = async (name, account_no, ifsc_code, swift_code, bank_name, branch_name, currency, user_id) => {
    var Query = `insert into bank(b_u_id,b_account_no,b_ifsc_code,b_swift_code,b_name,b_branch,b_currency,b_name_as)values(?,?,?,?,?,?,?,?)`;
    var data = await query(Query, [user_id, account_no, ifsc_code, swift_code, bank_name, branch_name, currency, name]);
    return data;
};

module.exports.UpdateUserKyc = async (u_id, u_country, u_currency) => {
    var Query = `update users set u_kyc = ?, u_country=?, u_currency=? where u_id = ?`;
    var data = await query(Query, ['pending', u_country, u_currency, u_id]);
    return data;
};


module.exports.CheckKyc = async (user_id, user_kyc) => {
    let Query = `select * from user_kyc where uk_u_id = ? and uk_id=?`;
    return await query(Query, [user_id, user_kyc]);
}

module.exports.UpdateKyc = async (kyc_id, front_page, back_page, bank_file) => {
    let Query = `update user_kyc set `
    let values = []
    if (front_page) {
        Query += `uk_front = ?,`
        values.push(front_page)
    }
    if (back_page) {
        Query += `uk_back = ?,`
        values.push(back_page)
    }
    if (bank_file) {
        Query += `uk_bank_statement = ?`
        values.push(bank_file)
    }
    Query += ` where uk_id = ?`
    values.push(kyc_id)
    return await query(Query, values);
}

module.exports.GetBank = async (user_id) => {
    let Query = `select * from bank where b_u_id=?`
    return await query(Query, [user_id])
}