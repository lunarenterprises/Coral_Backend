var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.updateContract = async (ui_id, reason) => {
    var Query = `update user_invest set ui_request=?,ui_request_reason=? where ui_id=?`;
    var data = await query(Query, ["termination", reason, ui_id]);
    return data;
};

module.exports.getusersdata = async (ui_id) => {
    var Query = `select * from user_invest
    inner join users on ui_u_id = u_id
    where ui_id = ?`;
    var data = await query(Query, [ui_id]);
    return data;
};

module.exports.checkContract = async (ui_id, user_id) => {
    var Query = `select * from user_invest where ui_id = ? and ui_u_id = ?`;
    var data = await query(Query, [ui_id, user_id]);
    return data;
}

