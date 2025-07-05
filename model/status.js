var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.ListAllStatus=async()=>{
    let Query=`select * from status where st_status=?`
    return await query(Query,['active'])
}