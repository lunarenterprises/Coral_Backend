var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getinvest = async (condition) => {
    var Query = `select * from return_invest ${condition}`;
    var data = await query(Query);
    return data;
};