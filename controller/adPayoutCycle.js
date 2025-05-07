var model = require('../model/adPayoutCycle');
var moment = require('moment');

module.exports.PayoutCycle = async (req, res) => {
    try {
        // var { inv_id } = req.body;
        var getinvest = await model.GetContract();
        console.log(getinvest, "investments fetched");

        var currentDate = moment(); // Current date for comparison
        if (getinvest.length > 0) {
            // Loop over the investments and process each one
            for (let invest of getinvest) {
                try {
                    var { ui_id, ui_u_id, ui_date, ui_duration, ui_return, ui_wf } = invest;
                    console.log(ui_id, ui_u_id, ui_date, ui_duration, ui_return, ui_wf, "investment details");

                    if (!ui_id || !ui_date || !ui_duration || !ui_wf) {
                        console.warn(`Skipping investment with missing data for ui_id: ${ui_id}`);
                        continue;
                    }


                    var investDate = moment(ui_date);
                    var endDate = moment(ui_duration);

                    // if (endDate.isBefore(currentDate, 'day')) {
                    //     console.log(`Investment ${ui_id} has already ended, skipping.`);
                    //     continue; // Skip if the investment has already ended
                    // }

                    let return_amount;
                    let totalPeriods;
                    let payoutDate;

                    switch (ui_wf) {
                        case 'Monthly':
                            totalPeriods = endDate.diff(investDate, 'months');
                            payoutDate = moment(investDate).add(1, 'month');
                            return_amount = ui_return / totalPeriods;
                            console.log(`Monthly payout for ${ui_id}: ${return_amount}, payout date: ${payoutDate.format('YYYY-MM-DD')}`);
                            break;

                        case 'Quarterly':
                            totalPeriods = endDate.diff(investDate, 'months') / 3;
                            payoutDate = moment(investDate).add(3, 'months');
                            return_amount = ui_return / totalPeriods;
                            console.log(`Quarterly payout for ${ui_id}: ${return_amount}, payout date: ${payoutDate.format('YYYY-MM-DD')}`);
                            break;

                        case 'Half-Yearly':
                            totalPeriods = endDate.diff(investDate, 'months') / 6;
                            payoutDate = moment(investDate).add(6, 'months');
                            return_amount = ui_return / totalPeriods;
                            console.log(`Half-yearly payout for ${ui_id}: ${return_amount}, payout date: ${payoutDate.format('YYYY-MM-DD')}`);
                            break;

                        case 'Yearly':
                            totalPeriods = endDate.diff(investDate, 'years');
                            payoutDate = moment(investDate).add(1, 'year');
                            return_amount = ui_return / totalPeriods;
                            console.log(`Yearly payout for ${ui_id}: ${return_amount}, payout date: ${payoutDate.format('YYYY-MM-DD')}`);
                            break;

                        default:
                            return res.send({
                                result: false,
                                message: `Invalid ui_wf value: ${ui_wf}`
                            });
                    }
                    let checkpayouthistory = await model.CheckPayoytHistory(ui_id, payoutDate.format('YYYY-MM-DD'))

                    if (checkpayouthistory.length == 0) {


                        // Insert the calculated payout into the database
                        var insertPayout = await model.AddPayout(ui_id, ui_u_id, ui_wf, payoutDate.format('YYYY-MM-DD'), return_amount);
                    }
                    console.log(`Payout for ${ui_id} scheduled for ${payoutDate.format('YYYY-MM-DD')} with amount: ${return_amount}`);

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
        var payoutsHistory = await model.GetPayoutHistory();
        console.log(payoutsHistory, "Payout history fetched");

        var currentDate = moment();
        var currentMonth = currentDate.month();

        if (payoutsHistory.length > 0) {
            // Loop over all previous payouts
            for (let payout of payoutsHistory) {
                try {
                    var { ph_invest_id, ph_payout_date } = payout;

                    console.log(ph_invest_id, ph_payout_date, "Payout details");

                    if (!ph_invest_id || !ph_payout_date) {
                        console.warn(`Skipping payout with missing data for invest_id: ${ph_invest_id}`);
                        continue;
                    }

                    // Fetch the investment details for the current payout
                    var getinvest = await model.GetContract(ph_invest_id);
                    if (getinvest.length > 0) {
                        var { ui_id, ui_u_id, ui_date, ui_duration, ui_return, ui_wf } = getinvest[0];
                        console.log(ui_id, ui_u_id, ui_date, ui_duration, ui_return, ui_wf, "Investment details");

                        var investDate = moment(ui_date);
                        var endDate = moment(ui_duration);

                        // Skip if the investment has already ended
                        if (endDate.isBefore(currentDate, 'day')) {
                            console.log(`Investment ${ui_id} has already ended, skipping.`);
                            continue; // Skip if the investment has already ended
                        }

                        // Parse the payout date to check if it matches the current month
                        var payoutDate = moment(ph_payout_date);
                        var payoutMonth = payoutDate.month(); // Payout month (0-11)

                        // If the payout month is the current month, create the next payout
                        if (payoutMonth === currentMonth) {
                            let nextPayoutDate;
                            let return_amount;
                            let totalPeriods;

                            // Determine the next payout based on the cycle type (ui_wf)
                            switch (ui_wf) {
                                case 'Monthly':
                                    totalPeriods = endDate.diff(investDate, 'months');
                                    nextPayoutDate = moment(payoutDate).add(1, 'month');
                                    return_amount = ui_return / totalPeriods;
                                    console.log(`Monthly payout for ${ui_id}: ${return_amount}, next payout date: ${nextPayoutDate.format('YYYY-MM-DD')}`);
                                    break;

                                case 'Quarterly':
                                    totalPeriods = endDate.diff(investDate, 'months') / 3;
                                    nextPayoutDate = moment(payoutDate).add(3, 'months');
                                    return_amount = ui_return / totalPeriods;
                                    console.log(`Quarterly payout for ${ui_id}: ${return_amount}, next payout date: ${nextPayoutDate.format('YYYY-MM-DD')}`);
                                    break;

                                case 'Half-yearly':
                                    totalPeriods = endDate.diff(investDate, 'months') / 6;
                                    nextPayoutDate = moment(payoutDate).add(6, 'months');
                                    return_amount = ui_return / totalPeriods;
                                    console.log(`Half-yearly payout for ${ui_id}: ${return_amount}, next payout date: ${nextPayoutDate.format('YYYY-MM-DD')}`);
                                    break;

                                case 'Yearly':
                                    totalPeriods = endDate.diff(investDate, 'years');
                                    nextPayoutDate = moment(payoutDate).add(1, 'year');
                                    return_amount = ui_return / totalPeriods;
                                    console.log(`Yearly payout for ${ui_id}: ${return_amount}, next payout date: ${nextPayoutDate.format('YYYY-MM-DD')}`);
                                    break;

                                default:
                                    return res.send({
                                        result: false,
                                        message: `Invalid ui_wf value: ${ui_wf}`
                                    });
                            }
                            let checkpayouthistory = await model.CheckPayoytHistory(ui_id, nextPayoutDate.format('YYYY-MM-DD'))

                            if (checkpayouthistory.length == 0) {
                                // Insert the new payout into the database
                                var insertPayout = await model.AddPayout(ui_id, ui_u_id, ui_wf, nextPayoutDate.format('YYYY-MM-DD'), return_amount);
                            }
                            console.log(`New payout for ${ui_id} scheduled for ${nextPayoutDate.format('YYYY-MM-DD')} with amount: ${return_amount}`);
                        } else {
                            console.log(`No payout needed for ${ui_id} in the current month.`);
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

        var payoutsHistory = await model.GetPayoutHistory();
        console.log(payoutsHistory, "Payout history fetched");

        var currentDate = moment();
        var currentMonth = currentDate.month(); // Get the current month (0-11)
        var currentDay = currentDate.date();   // Get the current day

        if (payoutsHistory.length > 0) {

            for (let payout of payoutsHistory) {
                try {
                    var { ph_id, ph_invest_id, ph_payout_date, ph_status } = payout;

                    console.log(ph_id, ph_invest_id, ph_payout_date, ph_status, "Payout details");

                    if (!ph_id || !ph_payout_date) {
                        console.warn(`Skipping payout with missing data for invest_id: ${ph_invest_id}`);
                        continue;
                    }

                    var payoutDate = moment(ph_payout_date);
                    var payoutMonth = payoutDate.month(); // Payout month (0-11)
                    var payoutDay = payoutDate.date(); // Payout day
                    console.log(payoutDay, "dayyy");

                    if (ph_status !== 'completed') {
                        if (payoutMonth === currentMonth) {
                            if (payoutDay >= currentDay) {

                                await model.UpdatePayoutStatus(ph_id, 'pending');
                                console.log(`Payout for ${ph_id} updated to 'pending'.`);

                            }

                            if (payoutDay <= 15 && currentDay > 15) {

                                await model.UpdatePayoutStatus(ph_id, 'due');
                                console.log(`Payout for ${ph_invest_id} updated to 'due' because the current date is past the 15th.`);

                            }

                            // if (payoutDay > 15 && currentDay >= 28) {

                            //     await model.UpdatePayoutStatus(ph_invest_id, 'due');
                            //     console.log(`Payout for ${ph_invest_id} updated to 'due' because the current date is past the 28th.`);

                            // }
                            if (currentMonth === 1) { // February (0-11, 1 is February)
                                // For February, handle the last day (28th or 29th)
                                if (currentDay >= (daysInMonth - 1) && payoutDay > 15) {
                                    await model.UpdatePayoutStatus(ph_id, 'due');
                                    console.log(`Payout for ${ph_invest_id} updated to 'due' because the current date is past the end of February.`);
                                }
                            } else {
                                // Handle other months where the 28th or 29th (for February) would be relevant
                                if (currentDay >= 30 && payoutDay > 15) {
                                    await model.UpdatePayoutStatus(ph_id, 'due');
                                    console.log(`Payout for ${ph_invest_id} updated to 'due' because the current date is past the 28th.`);
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
