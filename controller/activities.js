var walletModel = require('../model/wallettransaction')
var contractModel = require('../model/UserContractList')
var transferModel = require('../model/contracttransfer')
var referralModel = require('../model/referralBonus')

module.exports.Activities = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({ result: false, message: "User id not found" })
        }
        let { type } = req.body
        if (!type) {
            return res.send({ result: false, message: "Type is required" })
        }
        let data = []
        if (type === "all") {
            let walletData = await walletModel.Getwallet(user_id)
            let contractsData = await contractModel.GetUserContractList(user_id)
            let withdrawData = await contractModel.GetUserWithdraw(user_id)
            let transferData = await transferModel.getInvestedData(user_id)
            let refferalData = await referralModel.getReferralBonus(user_id)
            data = [...contractsData, ...withdrawData, ...walletData, ...transferData, ...refferalData].sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || a.date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || b.date || 0);
                return dateB - dateA;
            });
        } else if (type === "profit") {
            let contractsData = await contractModel.GetUserContractList(user_id)
            data = contractsData.sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                return dateB - dateA;
            })
        } else if (type === "withdraw") {
            let withdrawData = await contractModel.GetUserWithdraw(user_id)
            data = withdrawData.sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                return dateB - dateA;
            })
        } else if (type === "transfer") {
            let transferData = await transferModel.getInvestedData(user_id)
            data = transferData
                .filter(el => el.ui_status === "requestedForTransfer" || el.ui_status === "transfered")
                .sort((a, b) => {
                    const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                    const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                    return dateB - dateA;
                });

        } else if (type === "termination") {
            let transferData = await transferModel.getInvestedData(user_id)
            data = transferData
                .filter(el => el.ui_status === "terminated" || el.ui_status === "requestedForTermination")
                .sort((a, b) => {
                    const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                    const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                    return dateB - dateA;
                });
        } else if (type === "referral") {
            let refferalData = await referralModel.getReferralBonus(user_id)
            data = refferalData.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA;
            })
        } else {
           return res.send({ result: false, message: "Invalid type" })
        }
        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: data
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}