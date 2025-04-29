var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);


module.exports.AddToDB = async (data) => {
    await query('TRUNCATE TABLE return_invest');
    const insertQuery = `
                INSERT INTO return_invest 
                (ri_amount_from, ri_amount_to, ri_project, ri_return_year, ri_return_month, ri_wf, ri_duration, ri_security, ri_no_of_shares, ri_profit, ri_payout_amount) 
                VALUES ?
            `;

    const values = data.map(row => [
        row.ri_amount_from,
        row.ri_amount_to,
        row.ri_project,
        row.ri_return_year,
        row.ri_return_month,
        row.ri_wf,
        row.ri_duration,
        row.ri_security,
        row.ri_no_of_shares,
        row.ri_profit,
        row.ri_payout_amount
    ]);

    return await query(insertQuery, [values]);
}