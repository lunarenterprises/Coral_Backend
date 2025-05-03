var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.getAdmin = async (user_id, admin_role) => {
    var Query = `select * from users where u_id = ? and u_role =?`;
    var data = await query(Query, [user_id, admin_role]);
    return data;
};


module.exports.AddContractInvoiceQuery = async (newInvoiceId, contract_id, filepathh) => {
    var Query = `insert into contract_invoice(cni_invoice_id,cni_contract_id,cni_file) values (?,?,?)`;
    var data = await query(Query, [newInvoiceId, contract_id, filepathh]);
    return data;
};

module.exports.CheckContract = async (contract_id) => {
    var Query = `select * from user_invest where ui_id =?`;
    var data = await query(Query, [contract_id]);
    return data;
};


module.exports.CheckUser = async (u_id) => {
    var Query = `select * from users where u_id = ? `;
    var data = await query(Query, [u_id]);
    return data;
};

module.exports.CheckInvoice = async () => {
    var Query = `SELECT cni_invoice_id FROM contract_invoice order by cni_id desc limit 1`;
    var data = await query(Query);
    return data;
};
