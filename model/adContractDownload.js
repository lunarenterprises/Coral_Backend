var db = require('../db/db')
var util = require('util')
var query = util.promisify(db.query).bind(db)

module.exports.CheckAdmin = async (user_id, role) => {
    var Query = `select * from users where u_id =? and u_role =?`;
    var data = await query(Query, [user_id, role]);
    return data;
}

module.exports.getcontact = async (contract_id) => {
    var Query = `SELECT * FROM contract_invoice WHERE cni_contract_id =? `;
    var data = await query(Query, [contract_id]);
    return data;
}
