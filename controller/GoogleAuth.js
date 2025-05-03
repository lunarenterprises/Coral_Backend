let {Admin} = require('../util/firebaseConfig')

module.exports.GoogleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;  // Get the ID token from the frontend request
        console.log("idToken : ", idToken)

        if (!idToken) {
            return res.status(400).send('ID Token is required');
        }
        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await Admin.auth().verifyIdToken(idToken);
        console.log("decodedToken : ", decodedToken)
        const uid = decodedToken.uid;  // Extract the user UID from the decoded token
        console.log("uid : ", uid)

        // Optionally, you can fetch user details from Firebase Auth (if needed)
        const userRecord = await Admin.auth().getUser(uid);
        console.log("userRecord : ", userRecord)
        // After verification, you can return a response (e.g., user data, JWT, etc.)
        return res.status(200).json({
            uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            message: 'Authentication successful!',
        });
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}