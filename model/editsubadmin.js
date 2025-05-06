var db = require("../db/db");
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from admin where ad_id = ? and ad_role =?`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
};

module.exports.ChecksubadminQuery = async (subadmin_id) => {
    var Query = `select * from admin where ad_id= ?`;
    var data = query(Query, [subadmin_id]);
    return data;
};

module.exports.Changesubadmin = async (condition, subadmin_id) => {
    var Query = `update admin ${condition} where ad_id = ?`;
    var data = query(Query, [subadmin_id]);
    return data;
};

module.exports.Updateimage = async (image, subadmin_id) => {
    var Query = `update admin set ad_profile_pic = ?  where ad_id = ? `;
    var data = query(Query, [image, subadmin_id]);
    return data;
};
