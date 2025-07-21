const model = require('../model/users')

const generateReferralCode = (length = 5) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghjklmnopqrstuvwxyz*-_+.';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

module.exports.generateUniqueReferralCode = async (length = 5) => {
    let code;
    let exists = true;
    let retries = 0;
    const maxRetries = 5;

    while (exists && retries < maxRetries) {
        code = generateReferralCode(length);
        exists = await model.isReferralCodeExists(code);
        retries++;
    }

    if (exists) {
        throw new Error("Failed to generate a unique referral code after multiple attempts");
    }
    return code;
}
