var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.getInvest = async (c_id) => {
    var Query = `SELECT * FROM user_invest
inner join users on ui_u_id = u_id
where ui_id = ?`;
    var data = await query(Query, [c_id]);
    return data;
};

module.exports.Updateinvest = async (file, c_id) => {
    var Query = `update user_invest set ui_invoice_file = ? where ui_id = ?`;
    var data = await query(Query, [file, c_id]);
    return data;
};


module.exports.checkContract = async (c_id, user_id) => {
    var Query = `SELECT * FROM user_invest where ui_id = ? and ui_u_id = ?`;
    var data = await query(Query, [c_id, user_id]);
    return data;
}