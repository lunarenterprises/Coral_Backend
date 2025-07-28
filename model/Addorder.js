var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getBankaccount = async (bank_id) => {
    var Query = `select * from bank where b_id = ?`;
    var data = await query(Query, [bank_id]);
    return data;
};

module.exports.getUser = async (user_id) => {
    var Query = `select * from users where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.AddInvest = async (u_id, ui_date, ui_duration, ui_amount, ui_percentage, ui_return, ui_type, ui_security_option, project_name, withdrawal_frequency, bankAccount, nominee_id, invest_type) => {
    var Query = `insert into user_invest(ui_u_id,ui_date,ui_duration,ui_amount,ui_percentage,ui_return,ui_type,ui_security_option,ui_project_name,ui_wf,ui_bank_id,ui_nominee_id,ui_invest_type)values(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    var data = await query(Query, [u_id, ui_date, ui_duration, ui_amount, ui_percentage, ui_return, ui_type, ui_security_option, project_name, withdrawal_frequency, bankAccount, nominee_id, invest_type]);
    return data;
};

module.exports.AddNominee = async (user_id, name, relation, mobile, address) => {
    var Query = `insert into nominee(n_u_id,n_name,n_relation,n_mobile,n_address)values(?,?,?,?,?)`;
    var data = await query(Query, [user_id, name, relation, mobile, address]);
    return data;
};

module.exports.getUserBank = async (user_id) => {
    let Query = `select * from bank where b_u_id=?`
    return await query(Query, [user_id])
}

module.exports.UpdateWalletPayment = async (user_id, amount) => {
    let Query = `update users set u_wallet=u_wallet-${amount} where u_id=?`
    return await query(Query, [user_id])
}