const model = require('../model/users')

module.exports.generateUniqueReferralCode = async (length = 5) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghjklmnopqrstuvwxyz*-_+.';
    let code = '';
    let time = Date.now()
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += time
    return code;
}
