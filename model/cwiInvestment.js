var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.getBankDetails = async (user_id) => {
    var Query = `SELECT * FROM bank where b_u_id=?`;
    var data = await query(Query, [user_id]);
    return data;
};

module.exports.getFutureCompanyData=async(id)=>{
    var Query = `SELECT * FROM future_investments where fi_id=?`;
    var data = await query(Query, [id]);
    return data;
}

module.exports.getInvestedDetails = async (ui_id) => {
    var Query = `SELECT * FROM user_invest where ui_id=?`;
    var data = await query(Query, [ui_id]);
    return data;
}

module.exports.getnomineeDetails = async (ui_id) => {
    var Query = `SELECT * FROM nominee where n_u_id=?`;
    var data = await query(Query, [ui_id]);
    return data;
}