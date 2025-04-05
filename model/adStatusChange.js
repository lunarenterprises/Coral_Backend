var db = require('../db/db')
var util = require('util')
var query = util.promisify(db.query).bind(db)

module.exports.CheckAdmin = async (user_id, role) => {
    var Query = `select * from users where u_id =? and u_role =?`;
    var data = await query(Query, [user_id, role]);
    return data;
}
//-----------------------------------------
module.exports.GetContract = async (contract_id) => {
    var Query = `SELECT * FROM user_invest where ui_id = ?`;
    var data = await query(Query, [contract_id]);
    return data;
}
module.exports.ChangeContractStatus = async (contract_status, contract_id) => {
    var Query = `UPDATE user_invest SET ui_status = ? WHERE ui_id = ?`;
    var data = await query(Query, [contract_status, contract_id]);
    return data;
}

//-----------------------------------------
module.exports.GetUser = async (contract_id) => {
    var Query = `SELECT * FROM users where u_id = ?`;
    var data = await query(Query, [contract_id]);
    return data;
}
module.exports.ChangeUserStatus = async (activate_status, activate_user_id) => {
    var Query = `UPDATE users SET u_status = ? WHERE u_id = ?`;
    var data = await query(Query, [activate_status, activate_user_id]);
    return data;
}

//---------------------------------

module.exports.ChangeInvestReqStatus = async (invest_req_status, invest_req_id) => {
    var Query = `UPDATE user_invest SET ui_request_status = ? WHERE ui_id = ?`;
    var data = await query(Query, [invest_req_status, invest_req_id]);
    return data;
}

//------------------------------------

module.exports.GetPayout = async (payout_id) => {
    var Query = `SELECT * FROM payout_history where ph_id = ?`;
    var data = await query(Query, [payout_id]);
    return data;
}
module.exports.ChangePayoutStatus = async (payout_status, payout_id) => {
    var Query = `UPDATE payout_history SET ph_status = ? WHERE ph_id = ?`;
    var data = await query(Query, [payout_status, payout_id]);
    return data;
}

module.exports.AddWalletAmount = async (payout_amount, user_id) => {
    var Query = `UPDATE users SET u_wallet = u_wallet +${payout_amount} WHERE u_id = ?`;
    var data = await query(Query, [payout_amount, user_id]);
    return data;
}

module.exports.AddWalletHistory = async (user_id, payout_amount, currentdate) => {
    var Query = `insert into wallet (w_u_id,w_contract_type,w_amount,w_date) values (?,'fixed',?,?)`;
    var data = await query(Query, [user_id, payout_amount, currentdate]);
    return data;
}


//------------------------------------

module.exports.GetWithdrawel = async (withdrawel_id) => {
    var Query = `SELECT * FROM withdraw_request where wr_id = ?`;
    var data = await query(Query, [withdrawel_id]);
    return data;
}
module.exports.ChangeWithdrawelStatus = async (withdrawel_status, withdrawel_id) => {
    var Query = `UPDATE withdraw_request SET wr_status = ? WHERE wr_id = ?`;
    var data = await query(Query, [withdrawel_status, withdrawel_id]);
    return data;
}
module.exports.UpdateWallet = async (withdraw_amount, user_id) => {
    var Query = `UPDATE users SET u_wallet = u_wallet - ${withdraw_amount} WHERE u_id = ?`;
    var data = await query(Query, [withdraw_amount, user_id]);
    return data;
}

//--------------------------------------

module.exports.ChangeKycStatus = async (kyc_status, kyc_user_id) => {
    var Query = `UPDATE users SET u_kyc = ? WHERE u_id = ?`;
    var data = await query(Query, [kyc_status, kyc_user_id]);
    return data;
}

module.exports.AddKycMessage = async (kyc_message, kyc_user_id) => {
    var Query = `UPDATE user_kyc SET uk_reject_message = ? WHERE uk_u_id = ?`;
    var data = await query(Query, [kyc_message, kyc_user_id]);
    return data;
}
//--------------------------------------------

module.exports.ChangeInvestPatmentStatus = async (pay_invest_id, pay_invest_status) => {
    var Query = `UPDATE user_invest SET ui_payment_status = ? WHERE ui_id = ?`;
    var data = await query(Query, [pay_invest_status, pay_invest_id]);
    return data;
}

//-------------------------------