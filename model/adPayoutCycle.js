var db = require('../db/db')
var util = require('util')
var query = util.promisify(db.query).bind(db)

module.exports.GetContract = async (ph_invest_id) => {
    var condition = ''
    if (ph_invest_id) {
        condition = ` and ui_id =${ph_invest_id} `
    }
    var Query = `SELECT * FROM user_invest where ui_type = 'fixed' ${condition}`;
    var data = await query(Query);
    console.log(Query, "queryyyyyyyyyyyyyyyy");

    return data;
}

module.exports.AddPayout = async (ui_id, ui_u_id, ui_wf, payoutDate, return_amount) => {
    var Query = `insert into payout_history (ph_invest_id,ph_invest_u_id,ph_payout_cycle,ph_payout_date,ph_amount) values (?,?,?,?,?)`;
    var data = await query(Query, [ui_id, ui_u_id, ui_wf, payoutDate, return_amount]);
    return data;
}

module.exports.CheckPayoytHistory = async (ui_id, payoutDate) => {
    var Query = `SELECT * FROM payout_history where ph_invest_id =? and ph_payout_date =?`;
    var data = await query(Query, [ui_id, payoutDate]);
    return data;
}
module.exports.GetPayoutHistory = async () => {
    var Query = `SELECT * FROM payout_history `;
    var data = await query(Query);
    return data;
}

module.exports.UpdatePayoutStatus = async (ph_id, status) => {
    var Query = `update payout_history set ph_status= ? where ph_id =? `;
    var data = await query(Query, [status, ph_id]);
    console.log(Query, "qqqqqqqqqqqqq");

    return data;
}