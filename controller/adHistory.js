var model = require('../model/adHistory')

module.exports.History = async (req, res) => {
    try {


        let admin_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(admin_id, admin_role)
        if (adminData[0]?.ad_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }


        let { user_id } = req.user
        // if (!user_id) {
        //     return res.send({ result: false, message: "User id not found" })
        // }
        let { type } = req.body
        if (!type) {
            return res.send({ result: false, message: "Type is required" })
        }
        let data = []
        var usernotification = await model.getUserNotification(user_id)
        var adminnotification = await model.getAdminNotification(user_id)
        if (type === "all") {

            let walletData = await model.Getwallet(user_id)
            let contractsData = await model.getInvestedData(user_id)
            let withdrawData = await model.GetUserWithdraw(user_id)
            let transferData = await model.getInvestedData(user_id)
            let refferalData = await model.getReferralBonus(user_id)
            data = [...contractsData, ...withdrawData, ...walletData, ...transferData, ...refferalData].sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || a.date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || b.date || 0);
                return dateB - dateA;
            });
        } else if (type === "profit") {
            let contractsData = await model.GetUserContractList(user_id)
            data = contractsData.sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                return dateB - dateA;
            })
        } else if (type === "withdraw") {
            let withdrawData = await model.GetUserWithdraw(user_id)
            data = withdrawData.sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                return dateB - dateA;
            })
        } else if (type === "transfer") {
            let transferData = await model.getInvestedData(user_id)
            data = transferData
                .filter(el => el.ui_status === "requestedForTransfer" || el.ui_status === "transfered")
                .sort((a, b) => {
                    const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                    const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                    return dateB - dateA;
                });

        } else if (type === "termination") {
            let transferData = await model.getInvestedData(user_id)
            data = transferData
                .filter(el => el.ui_status === "terminated" || el.ui_status === "requestedForTermination")
                .sort((a, b) => {
                    const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                    const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                    return dateB - dateA;
                });
        } else if (type === "referral") {
            let refferalData = await model.getReferralBonus(user_id)
            data = refferalData.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA;
            })
        } else {
            res.send({ result: false, message: "Invalid type" })
        }
        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: data,
            adminnotification: adminnotification,
            usernotification: usernotification
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}