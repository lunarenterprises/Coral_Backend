var moment = require('moment');
var db = require('../db/db')
var util = require('util')
var query = util.promisify(db.query).bind(db)

module.exports.PayoutCycle = async (req, res) => {
    try {

        // var { inv_id } = req.body;
        var getinvest = await GetContract();

        var currentDate = moment(); // Current date for comparison
        if (getinvest.length > 0) {
            // Loop over the investments and process each one
            for (let invest of getinvest) {
                try {
                    var { ui_id, ui_u_id, ui_date, ui_duration, ui_return, ui_type, ui_wf } = invest;
                    ui_wf = ui_wf.toLowerCase()
                    ui_type = ui_type.toLowerCase()


                    if (!ui_id || !ui_date || !ui_duration || !ui_type) {
                        console.warn(`Skipping investment with missing data for ui_id: ${ui_id}`);
                        continue;
                    }


                    var investDate = moment(ui_date, 'YYYY-MM-DD'); // or match your input format
                    var endDate = moment(ui_duration, 'YYYY-MM-DD');
                    if (ui_type == 'fixed') {

                        let payoutDate;

                        // Determine base payout date based on the 15th/30th rule
                        function getBasePayoutDate(investDate, monthsToAdd = 1) {
                            let baseDate = moment(investDate).add(monthsToAdd, 'months');

                            if (investDate.date() <= 15) {
                                return baseDate.date(15);
                            } else {
                                if (baseDate.month() === 1) { // February
                                    if (baseDate.isLeapYear()) {
                                        return baseDate.date(29);
                                    }
                                    return baseDate.date(28);
                                }
                                return baseDate.date(30);
                            }
                        }

                        let return_amount;
                        let totalPeriods;

                        switch (ui_wf) {
                            case 'monthly':
                                totalPeriods = endDate.diff(investDate, 'months');
                                payoutDate = getBasePayoutDate(investDate, 1);
                                return_amount = ui_return / totalPeriods;
                                break;

                            case 'quarterly':
                                totalPeriods = endDate.diff(investDate, 'months') / 3;
                                payoutDate = getBasePayoutDate(investDate, 3);
                                return_amount = ui_return / totalPeriods;
                                break;

                            case 'half-yearly':
                                totalPeriods = endDate.diff(investDate, 'months') / 6;
                                payoutDate = getBasePayoutDate(investDate, 6);
                                return_amount = ui_return / totalPeriods;
                                break;

                            case 'yearly':
                                totalPeriods = endDate.diff(investDate, 'years');
                                payoutDate = getBasePayoutDate(investDate, 12);
                                return_amount = ui_return / totalPeriods;
                                break;

                            default:
                                return res.send({
                                    result: false,
                                    message: `Invalid ui_wf value: ${ui_wf}`
                                });
                        }

                        let checkpayouthistory = await CheckFixedPayoutHistory(ui_id, payoutDate.format('YYYY-MM-DD'))

                        if (checkpayouthistory.length == 0) {


                            // Insert the calculated payout into the database
                            var insertPayout = await AddFixedPayout(ui_id, ui_u_id, ui_type, ui_wf, payoutDate.format('YYYY-MM-DD'), return_amount);
                        }
                    } else {

                        let checkpayouthistory = await CheckFlexiblePayoutHistory(ui_id, ui_type)

                        if (checkpayouthistory.length == 0) {
                            var insertPayout = await AddFlexiblePayout(ui_id, ui_u_id, ui_type);
                        }
                    }
                } catch (err) {
                    console.error(`Error processing investment ${invest.ui_id}: ${err.message}`);
                }
            }

            return res.send({
                result: true,
                message: "Payouts created successfully."
            });

        } else {
            return res.send({
                result: false,
                message: "No investments found."
            });
        }

    } catch (error) {
        console.log("Error processing request: ", error);
        return res.send({
            result: false,
            message: error.message
        });
    }
};



module.exports.CheckAndCreateNextPayout = async (req, res) => {
    try {

        // Fetch all the previous payouts from the database
        var payoutsHistory = await GetPayoutHistory();

        var currentDate = moment();
        var currentMonth = currentDate.month();

        if (payoutsHistory.length > 0) {
            // Loop over all previous payouts
            for (let payout of payoutsHistory) {
                try {
                    var { ph_invest_id, ph_invest_type, ph_payout_date, } = payout;


                    if (!ph_invest_id || !ph_invest_type) {
                        console.warn(`Skipping payout with missing data for invest_id: ${ph_invest_id}`);
                        continue;
                    }

                    // Fetch the investment details for the current payout
                    var getinvest = await GetContract(ph_invest_id);
                    if (getinvest.length > 0) {
                        var { ui_id, ui_u_id, ui_date, ui_duration, ui_return, ui_type, ui_wf } = getinvest[0];
                        ui_wf = ui_wf.toLowerCase()
                        ui_type = ui_type.toLowerCase()


                        var investDate = moment(ui_date);
                        var endDate = moment(ui_duration);
                        if (ui_type == 'fixed') {


                            // Skip if the investment has already ended
                            if (endDate.isBefore(currentDate, 'day')) {
                                continue; // Skip if the investment has already ended
                            }

                            // Parse the payout date to check if it matches the current month
                            var payoutDate = moment(ph_payout_date);
                            var payoutMonth = payoutDate.month(); // Payout month (0-11)

                            // Get current date/month
                            var currentMonth = moment().month(); // Make sure this is defined
                            var return_amount, totalPeriods;

                            // Helper function to determine correct payout day (15th, 30th or Feb logic)
                            function getNextPayoutDate(baseDate, monthsToAdd = 1) {
                                let nextDate = moment(baseDate).add(monthsToAdd, 'months');

                                if (baseDate.date() <= 15) {
                                    return nextDate.date(15);
                                } else {
                                    if (nextDate.month() === 1) { // February
                                        return nextDate.isLeapYear() ? nextDate.date(29) : nextDate.date(28);
                                    } else {
                                        return nextDate.date(30);
                                    }
                                }
                            }

                            // If the payout month is the current month, create the next payout
                            if (payoutMonth === currentMonth) {
                                let nextPayoutDate;

                                switch (ui_wf) {
                                    case 'monthly':
                                        totalPeriods = endDate.diff(investDate, 'months');
                                        nextPayoutDate = getNextPayoutDate(payoutDate, 1);
                                        return_amount = ui_return / totalPeriods;
                                        break;

                                    case 'quarterly':
                                        totalPeriods = endDate.diff(investDate, 'months') / 3;
                                        nextPayoutDate = getNextPayoutDate(payoutDate, 3);
                                        return_amount = ui_return / totalPeriods;
                                        break;

                                    case 'half-yearly':
                                        totalPeriods = endDate.diff(investDate, 'months') / 6;
                                        nextPayoutDate = getNextPayoutDate(payoutDate, 6);
                                        return_amount = ui_return / totalPeriods;
                                        break;

                                    case 'yearly':
                                        totalPeriods = endDate.diff(investDate, 'years');
                                        nextPayoutDate = getNextPayoutDate(payoutDate, 12);
                                        return_amount = ui_return / totalPeriods;
                                        break;

                                    default:
                                        return res.send({
                                            result: false,
                                            message: `Invalid ui_wf value: ${ui_wf}`
                                        });
                                }

                                // Check if payout already exists
                                let checkpayouthistory = await CheckFixedPayoutHistory(ui_id, nextPayoutDate.format('YYYY-MM-DD'));

                                if (checkpayouthistory.length == 0) {
                                    // Insert the new payout into the database
                                    var insertPayout = await AddFixedPayout(ui_id, ui_u_id, ui_type, ui_wf, nextPayoutDate.format('YYYY-MM-DD'), return_amount);
                                }

                            } else {
                                console.log(`No payout needed for ${ui_id} in the current month.`);
                            }
                        }
                    } else {
                        console.warn(`Investment not found for ph_invest_id: ${ph_invest_id}`);
                    }
                } catch (err) {
                    console.error(`Error processing payout ${payout.ph_invest_id}: ${err.message}`);
                }
            }

            return res.send({
                result: true,
                message: "Next payouts checked and created successfully."
            });

        } else {
            return res.send({
                result: false,
                message: "No payout history found."
            });
        }

    } catch (error) {
        console.log(error);
        return res.send({
            result: false,
            message: error.message
        });
    }
};

module.exports.CheckAndUpdatePayoutStatus = async (req, res) => {
    try {

        var payoutsHistory = await GetPayoutHistory();

        var currentDate = moment();
        var currentMonth = currentDate.month(); // Get the current month (0-11)
        var currentDay = currentDate.date();   // Get the current day

        if (payoutsHistory.length > 0) {

            for (let payout of payoutsHistory) {
                try {
                    var { ph_id, ph_invest_id, ph_payout_date, ph_status } = payout;


                    if (!ph_id || !ph_payout_date) {
                        console.warn(`Skipping payout with missing data for invest_id: ${ph_invest_id}`);
                        continue;
                    }

                    var payoutDate = moment(ph_payout_date);
                    var payoutMonth = payoutDate.month(); // Payout month (0-11)
                    var payoutDay = payoutDate.date(); // Payout day
                    if (ph_status !== 'completed') {
                        if (payoutMonth === currentMonth) {
                            if (payoutDay >= currentDay) {

                                await UpdatePayoutStatus(ph_id, 'pending');

                            }

                            if (payoutDay <= 15 && currentDay > 15) {

                                await UpdatePayoutStatus(ph_id, 'due');

                            }

                            // if (payoutDay > 15 && currentDay >= 28) {

                            //     await UpdatePayoutStatus(ph_invest_id, 'due');

                            // }
                            if (currentMonth === 1) { // February (0-11, 1 is February)
                                // For February, handle the last day (28th or 29th)
                                if (currentDay >= (daysInMonth - 1) && payoutDay > 15) {
                                    await UpdatePayoutStatus(ph_id, 'due');
                                }
                            } else {
                                // Handle other months where the 28th or 29th (for February) would be relevant
                                if (currentDay >= 30 && payoutDay > 15) {
                                    await UpdatePayoutStatus(ph_id, 'due');
                                }
                            }
                        }
                    }

                } catch (err) {
                    console.error(`Error processing payout ${payout.ph_id}: ${err.message}`);
                }
            }

            return res.send({
                result: true,
                message: "Payout statuses checked and updated successfully."
            });

        } else {
            return res.send({
                result: false,
                message: "No payout history found."
            });
        }

    } catch (error) {
        console.log("Error processing request: ", error);
        return res.send({
            result: false,
            message: error.message
        });
    }
};


const GetContract = async (ph_invest_id) => {
    let condition = ''
    if (ph_invest_id) {
        condition = `where ui_id =${ph_invest_id}`

    }
    var Query = `SELECT * FROM user_invest ${condition} `;
    return await query(Query);

}

const AddFixedPayout = async (ui_id, ui_u_id, ui_type, ui_wf, payoutDate, return_amount) => {
    var Query = `insert into payout_history (ph_invest_id,ph_invest_u_id,ph_invest_type,ph_payout_cycle,ph_payout_date,ph_amount) values (?,?,?,?,?,?)`;
    return await query(Query, [ui_id, ui_u_id, ui_type, ui_wf, payoutDate, return_amount]);
}

const AddFlexiblePayout = async (ui_id, ui_u_id, ui_type) => {
    var Query = `insert into payout_history (ph_invest_id,ph_invest_u_id,ph_invest_type) values (?,?,?)`;
    return await query(Query, [ui_id, ui_u_id, ui_type]);
}

const CheckFixedPayoutHistory = async (ui_id, payoutDate) => {
    var Query = `SELECT * FROM payout_history where ph_invest_id =? and ph_payout_date =?`;
    return await query(Query, [ui_id, payoutDate]);
}

const CheckFlexiblePayoutHistory = async (ui_id, ui_type) => {
    var Query = `SELECT * FROM payout_history where ph_invest_id =? and ph_invest_type =?`;
    return await query(Query, [ui_id, ui_type]);
}
const GetPayoutHistory = async () => {
    var Query = `SELECT * FROM payout_history where ph_status <> 'completed' `;
    return await query(Query);

}

const UpdatePayoutStatus = async (ph_id, status) => {
    var Query = `update payout_history set ph_status= ? where ph_id =? `;
    return await query(Query, [status, ph_id]);

}

