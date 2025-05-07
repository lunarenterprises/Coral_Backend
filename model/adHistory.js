var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role =?`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
};


module.exports.getInvestedData = async (user_id) => {
    var condition = ''
    if (user_id) {
        condition = ` where ui.ui_u_id = ${user_id} `
    }

    var Query = `SELECT 
    us.u_id,
    us.u_name,
    us.u_email,
    us.u_mobile,
    us.u_status,
    us.u_kyc,
    us.u_joining_date,
    us.u_easy_pin,
    ui.*, 
    n.*, 
    b.*, 
    uk.*
    FROM user_invest ui
    LEFT JOIN users us ON ui.ui_u_id = us.u_id
    LEFT JOIN nominee n ON ui.ui_u_id = n.n_u_id 
    LEFT JOIN bank b ON ui.ui_u_id = b.b_u_id
    LEFT JOIN user_kyc uk ON ui.ui_u_id = uk.uk_u_id ${condition}`;
    var data = await query(Query);
    return data;
}

module.exports.Getwallet = async (user_id) => {
    var condition = ''

    if (user_id) {
        condition = ` where w_u_id = ${user_id} `
    }
    var Query = `select * from wallet ${condition}`;
    var data = await query(Query);
    return data;
};


module.exports.GetUserWithdraw = async (user_id) => {
    var condition = ''

    if (user_id) {
        condition = `where wr_u_id= ${user_id} `
    }
    var Query = `select * from withdraw_request ${condition} `;
    var data = await query(Query);
    return data;
}

module.exports.getReferralBonus = async (user_id) => {
    var condition = ''

    if (user_id) {
        condition = ` where u_id= ${user_id} AND amount IS NOT NULL `
    } else {
        condition = ` where amount IS NOT NULL `
    }
    var Query = `SELECT * FROM referral_bonus ${condition} `;
    var data = await query(Query);
    return data;
};

module.exports.getUserNotification = async (user_id) => {
    var condition = ''

    if (user_id) {
        condition = ` and user_id = ${user_id} `
    }
    var Query = `SELECT n.*, us.u_name FROM notifications n LEFT JOIN users us ON n.user_id = us.u_id WHERE n.role = 'user'${condition} `;

    var data = await query(Query);
    return data;
};

module.exports.getAdminNotification = async (user_id) => {
    var condition = ''

    if (user_id) {
        condition = ` and user_id= ${user_id} `
    }
    var Query = `SELECT n.*, us.u_name FROM notifications n LEFT JOIN users us ON n.user_id = us.u_id WHERE n.role <> 'user'${condition} `;
    var data = await query(Query);
    return data;
};
