const Notification = require('../model/SaveNotification');
const UserToken = require('../model/getUserTokens')


module.exports.addNotification = async (userId, userRole, type, message) => {
    try {
        let notification = await Notification.createNotification(userId, userRole, type, message);
        return notification.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

module.exports.getUserTokens = async (userId) => {
    try {
        return await UserToken.getUserToken(userId)
    } catch (error) {
        return false
    }
}


////HERE THE FUNCTION TO GET ADMIN FCM TOKEN////
module.exports.getAdminTokens=async()=>{
    try{
        return await UserToken.getAdminTokens()
    }catch(error){
        return false
    }
}