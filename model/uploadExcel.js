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


module.exports.AddHgfsData = async (data) => {
    await query('TRUNCATE TABLE hgfs');
    const insertQuery = `INSERT INTO hgfs (h_industry,h_previous_years,h_last_year,h_growth) VALUES ? `;

    const values = data.map(row => [
        row.industry,
        row.previous_year_growth,
        row.last_year_growth,
        row.growth,
    ]);

    return await query(insertQuery, [values]);
}




module.exports.AddCurrentInvestmentData = async (data) => {
    await query('TRUNCATE TABLE top_company');
    const insertQuery = `INSERT INTO top_company (tc_name, tc_current_year, tc_growth_percentage,tc_minimum_investment,tc_current_CAGR,tc_expected_CAGR) VALUES ? `;

    const values = data.map(row => [
        row.company,
        row.current_investment,
        row.growth_percent,
        row.min_investment,
        row.tc_current_CAGR,
        row.tc_expected_CAGR
    ]);

    return await query(insertQuery, [values]);
}


module.exports.AddFutureInvestmentData = async (data) => {
    await query('TRUNCATE TABLE future_investments');
    const insertQuery = `INSERT INTO future_investments (fi_industries,fi_plan_to_invest,fi_expected_return,fi_minimum_investment) VALUES ? `;

    const values = data.map(row => [
        row.industry,
        row.planned_investment,
        row.expected_roi,
        row.min_investment
    ]);

    return await query(insertQuery, [values]);
}


