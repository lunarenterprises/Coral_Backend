var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role =?`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
};

module.exports.GetUserContractList = async (condition, type) => {
    if (type) {

        if (type === 'all') {
            var Query = `SELECT * FROM user_invest ui LEFT JOIN nominee n ON ui.ui_nominee_id = n.n_id`;
        } else {
            var Query = `SELECT * FROM user_invest ui LEFT JOIN nominee n ON ui.ui_nominee_id = n.n_id where ui.ui_type =? `;
        }
    } else {
        var Query = `SELECT * FROM user_invest ui LEFT JOIN nominee n ON ui.ui_nominee_id = n.n_id ${condition}`;
    }
    var data = await query(Query, [type]);

    return data;
};


// module.exports.GetUserWithdraw = async (user_id) => {
//     var Query = `select * from withdraw_request where wr_u_id=? `;
//     var data = await query(Query, [user_id]);
//     return data;
// }