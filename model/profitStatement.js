var db = require("../db/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);
const moment = require('moment');  // If you need moment.js for date manipulation

module.exports.getProfitStatement = async (user_id, monthsAgo = 0) => {
    // Calculate the date range based on the monthsAgo (only if monthsAgo is provided or greater than 0)
    let startDate = null;

    if (monthsAgo > 0) {
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - monthsAgo);  // Subtract monthsAgo months from current date
        startDate = currentDate.toISOString().split('T')[0];  // Format as 'YYYY-MM-DD'
    }

    // SQL query to fetch user investment data with optional date filtering
    let Query = `
        SELECT 
            *
        FROM 
            user_invest ui 
        LEFT JOIN 
            nominee n ON ui.ui_nominee_id = n.n_id
        WHERE 
            ui.ui_u_id = ?
    `;

    // If monthsAgo is provided, add date filter to the query
    if (startDate) {
        Query += ` AND ui.ui_date >= ?`;
    }

    // Fetch data based on the user_id and the date range if applicable
    const queryParams = startDate ? [user_id, startDate] : [user_id];
    const data = await query(Query, queryParams);

    return data;
};



module.exports.getUser = async (user_id) => {
    let Query = `SELECT * FROM users WHERE u_id=?`;
    const data = await query(Query, [user_id]);
    return data
}


module.exports.GetBankData=async(user_id)=>{
    let Query=`select * from bank where b_u_id=?`
    return await query(Query,[user_id])
}