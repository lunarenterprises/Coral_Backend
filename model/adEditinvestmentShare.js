var db = require("../db/db");
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from users where u_id = ? and u_role =?`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
};

module.exports.CheckSharedilutionQuery = async (invest_id) => {
    var Query = `select * from user_invest where ui_id= ?`;
    var data = query(Query, [invest_id]);
    return data;
};

module.exports.ChangeSharedilution = async (condition, invest_id) => {
    var Query = `update user_invest ${condition} where ui_id = ?`;
    var data = query(Query, [invest_id]);
    return data;
};

//-----------------------------------------------

module.exports.CheckInvestmentCalculaterQuery = async (ri_id) => {
    var Query = `select * from return_invest where ri_id= ?`;
    var data = query(Query, [ri_id]);
    return data;
};

module.exports.ChangeInvestmentCalculater = async (condition, ri_id) => {
    var Query = `update return_invest ${condition} where ri_id = ?`;
    var data = query(Query, [ri_id]);
    return data;
};
