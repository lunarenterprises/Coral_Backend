var db = require("../db/db");
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.getNotifications = async (user_id) => {
    // Step 1: Fetch notifications for the user
    var fetchQuery = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
    var notifications = await query(fetchQuery, [user_id]);

    if (notifications.length > 0) {
        // Step 2: Update the status of fetched notifications to "read"
        var updateQuery = `
            UPDATE notifications
            SET status = 'read'
            WHERE user_id = ? AND status = 'unread'
        `;
        await query(updateQuery, [user_id]);
    }

    return notifications;
};