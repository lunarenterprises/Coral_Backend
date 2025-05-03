let admin = require("firebase-admin");
let Notification = require('../util/saveNotification')

let serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


module.exports.SendMessage = async (userId, type, message) => {
    try {
        let userTokens = await Notification.getUserTokens(userId)
        userTokens.forEach(async (el) => {
            const payload = {
                token: el.fcm_token,
                notification: {
                    title: type, // Title of the notification
                    body: message,             // Body/content of the notification
                },
            }
            try {
                let response = await admin.messaging().send(payload)
                console.log("response : ", response)
            } catch (error) {
                console.log("error : ", error.message)
            }
        })
    } catch (error) {
        return error
    }
}


/////HERE THE FUNCTION TO SEND NOTIFICATION TO ADMINS////
module.exports.sendNotificationToAdmins = async (type, message) => {
    try {
        let adminTokens = await Notification.getAdminTokens()
        adminTokens.forEach(async (el) => {
            const payload = {
                token: el.fcm_token,
                notification: {
                    title: type, // Title of the notification
                    body: message,             // Body/content of the notification
                },
            }
            try {
                let response = await admin.messaging().send(payload)
                console.log("response : ", response)
            } catch (error) {
                console.log("error : ", error.message)
            }
        })
    } catch (error) {
        return error
    }
}

module.exports.Admin = admin