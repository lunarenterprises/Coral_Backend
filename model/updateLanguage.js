    var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.updateLanguage = async (user_id, u_language) => {
    var Query = `UPDATE users 
        SET 
            u_language = ?
            where u_id = ?;
    `;
    var data = await query(Query, [u_language, user_id]);
    return data;
};
