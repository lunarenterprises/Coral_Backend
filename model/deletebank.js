var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.Deletebank = async (b_id) => {
    var Query = `delete from bank where b_id = ? `;
    var data = await query(Query, [b_id]);
    return data;
};


module.exports.UpdateKycStatus = async (user_id) => {
    let Query = `update users set u_kyc=? where u_id=?`
    return await query(Query, ["pending", user_id])
}