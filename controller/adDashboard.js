var model = require('../model/adDashboard');

module.exports.Dashboard = async (req, res) => {
    try {
        let user_id = req.user.admin_id;
        let admin_role = req.user.role;

        // Fetch admin data to check the role
        var adminData = await model.getAdmin(user_id, admin_role);
        if (adminData[0]?.ad_role === 'user') {
            return res.send({
                result: false,
                message: "Access Denied, try with an authorized account"
            });
        }


        var getuser = await model.getusers();
        var getinvestment = await model.getInvestment();


        // Filter users by status
        var getactiveuser = await filterDataByStatus(getuser, 'active');
        var getpendinguser = await filterDataByStatus(getuser, 'pending');
        var getnewusers = await filterUsersRegisteredLast7Days(getuser)

        var monthlyusers = await groupUsersByMonth(getuser)

        var revenuetrend = await groupInvestmentsByMonthWithTotalAmount(getinvestment)

        var todaysinvestment = await getInvestmentChangeTodayVsYesterday(getinvestment)

        var activeinvestment = await filterInvestmentByStatus(getinvestment, 'active')
        var pendinginvestment = await filterInvestmentByStatus(getinvestment, 'pending')
        var completednvestment = await filterInvestmentByStatus(getinvestment, 'completed')




        if (getuser.length > 0) {
            return res.send({
                result: true,
                message: "Data retrieved",
                totalusers: getuser.length,
                activeuser: getactiveuser.length,
                pendinguser: getpendinguser.length,
                newusers: getnewusers,
                revenuetrend: revenuetrend,
                monthlyusers: monthlyusers,
                todaysinvestment: todaysinvestment,
                activeinvestment: activeinvestment.length,
                pendinginvestment: pendinginvestment.length,
                completednvestment: completednvestment.length,
                u_access: adminData[0]?.ad_access

            });
        } else {
            return res.send({
                result: false,
                message: "Admins list details not found"
            });
        }
    } catch (error) {
        console.error("Error in Dashboard Handler:", error.stack);

        return res.send({
            result: false,
            message: error.message
        });
    }
};

async function filterDataByStatus(getuser, status) {
    return getuser.filter(data => data.u_status === status);
}
//-------------------------------------------------//

async function filterInvestmentByStatus(getinvestment, status) {
    return getinvestment.filter(data => data.ui_status === status);
}

//-------------------------------------//

async function filterUsersRegisteredLast7Days(getuser) {
    const currentDate = new Date();  // Get the current date
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);  // Subtract 7 days from the current date

    return getuser.filter(data => {
        const userRegisteredDate = new Date(data.u_joining_date);  // Assuming 'u_registered_date' is in a valid date format
        return userRegisteredDate >= sevenDaysAgo && userRegisteredDate <= currentDate; // Check if the registration date is within the last 7 days
    });
}

//-----------------------------------//

async function groupInvestmentsByMonthWithTotalAmount(getinvestment) {
    // Define an array of month names for sorting
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Group the investments by month and calculate the total amount per month
    const groupedByMonth = getinvestment.reduce((acc, investment) => {
        const investmentDate = new Date(investment.ui_date); // Assuming 'investment_date' is the field with the date
        const month = investmentDate.getMonth();  // Get the month (0 = January, 1 = February, etc.)

        // If the month doesn't exist in the accumulator, create an array for it
        if (!acc[month]) {
            acc[month] = {
                investments: [],
                totalAmount: 0 // Initialize total amount for each month
            };
        }

        // Push the investment to the corresponding month
        acc[month].investments.push(investment);

        // Add the amount to the total amount for that month
        acc[month].totalAmount += investment.ui_amount;

        return acc;
    }, {});

    // Create an array to store sorted results with the total amount for each month
    const sortedInvestments = monthNames.map((monthName, monthIndex) => {
        // Get the investments for this month and the total amount
        const { investments, totalAmount } = groupedByMonth[monthIndex] || { investments: [], totalAmount: 0 };

        // Return an object with the month name, total amount, and the corresponding investments
        return {
            month: monthName,
            totalAmount: totalAmount,
            // investments: investments
        };
    });

    return sortedInvestments;
}

//-------------------------------------------------//

async function groupUsersByMonth(userData) {
    // Define an array of month names for sorting
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Group the users by month and count the number of registrations per month
    const groupedByMonth = userData.reduce((acc, user) => {
        const registrationDate = new Date(user.u_joining_date); // Assuming 'registration_date' is the field with the date
        const month = registrationDate.getMonth();  // Get the month (0 = January, 1 = February, etc.)

        // If the month doesn't exist in the accumulator, create an entry for it
        if (!acc[month]) {
            acc[month] = {
                userCount: 0, // Initialize user count for this month
                users: []
            };
        }

        // Increment the user count for this month
        acc[month].userCount++;

        // Push the user to the corresponding month
        acc[month].users.push(user);

        return acc;
    }, {});

    // Create an array to store sorted results with the user count per month
    const sortedUsers = monthNames.map((monthName, monthIndex) => {
        // Get the count and users for this month
        const { userCount, users } = groupedByMonth[monthIndex] || { userCount: 0, users: [] };

        // Return an object with the month name, user count, and the corresponding users
        return {
            month: monthName,
            userCount: userCount,
            // users: users
        };
    });

    return sortedUsers;
}


//--------------------------------------------------------//

async function getInvestmentChangeTodayVsYesterday(getinvestment) {
    // Get today's date and yesterday's date
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1); // Set yesterday's date

    // Format the dates to match the investment date format (e.g., 'YYYY-MM-DD')
    const todayString = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const yesterdayString = yesterday.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    // Filter investments for today and yesterday
    const investmentsToday = getinvestment.filter(investment => {
        const investmentDate = new Date(investment.ui_date).toISOString().split('T')[0];
        return investmentDate === todayString;
    });

    const investmentsYesterday = getinvestment.filter(investment => {
        const investmentDate = new Date(investment.ui_date).toISOString().split('T')[0];
        return investmentDate === yesterdayString;
    });

    // Calculate the total investment for today and yesterday
    const totalToday = investmentsToday.reduce((sum, investment) => sum + investment.ui_amount, 0);
    const totalYesterday = investmentsYesterday.reduce((sum, investment) => sum + investment.ui_amount, 0);

    // Calculate the percentage change from yesterday to today
    let percentageChange = 0;
    if (totalYesterday > 0) {
        percentageChange = ((totalToday - totalYesterday) / totalYesterday) * 100;
    } else if (totalYesterday === 0 && totalToday > 0) {
        percentageChange = 100; // If no investments yesterday and there are investments today, consider 100% increase
    } else if (totalYesterday === 0 && totalToday === 0) {
        percentageChange = 0; // No investments on both days, no change
    } else if (totalYesterday === 0 && totalToday < 0) {
        percentageChange = -100; // If negative investments today (edge case)
    }

    return {
        today: totalToday,
        yesterday: totalYesterday,
        percentageChange: percentageChange
    };
}


//------------------------------------------------------//