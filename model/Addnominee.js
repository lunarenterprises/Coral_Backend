var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.addnominee = async (u_id, name, relation, email, gender, country, mobile, address, id_type, image) => {
    var Query = `insert into nominee(n_u_id,n_name,n_relation,n_email,n_gender,n_country,n_mobile,n_address,n_id_type,n_id_proof)values(?,?,?,?,?,?,?,?,?,?)`;
    var data = await query(Query, [u_id, name, relation, email, gender, country, mobile, address, id_type, image]);
    return data;
};

module.exports.uploadNomineeForm = async (id, form) => {
    var Query = `update nominee set n_form=? where n_id=?`;
    var data = await query(Query, [form, id]);
    return data;
}

module.exports.CheckInvestment = async (investment_id, user_id) => {
    let Query = `select * from user_invest where ui_id=? and ui_u_id=?`
    return await query(Query, [investment_id, user_id])
}

module.exports.Assign = async (nomine_id, investment_id) => {
    let Query = `update user_invest set ui_nominee_id=? where ui_id=?`
    return await query(Query, [nomine_id, investment_id])
}