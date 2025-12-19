var model = require('../model/UserContractList')


module.exports.UserContractList = async (req, res) => {
    try {
        var { user_id } = req.user
        var { type } = req.body
        if (!type) {
            return res.send({
                result: false,
                message: "Type is required"
            })
        }
        if (type && type !== 'all' && type !== "invest" && type !== "withdraw" && type !== "fixed" && type !== "flexible") {
            return res.send({
                result: false,
                message: "Invalid type"
            })
        }
        if (!user_id) {
            return res.send({
                result: false,
                message: "User ID is required"
            })
        }
        let contracts = []
        if (type === 'all' || !type) {
            let contractsData = await model.GetUserContractList(user_id)
            // let withdrawData = await model.GetUserWithdraw(user_id)
            contracts = contractsData.sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date); // Use ui_date if available, otherwise use wr_date
                const dateB = new Date(b.ui_date || b.wr_date);

                return dateB - dateA; // Sort in ascending order
            });
        } else if (type === 'invest') {
            let contractsData = await model.GetUserContractList(user_id)
            contracts = contractsData.sort((a, b) => b.ui_date - a.ui_date)
        } else if (type === 'withdraw') {
            let withdrawData = await model.GetUserWithdraw(user_id)
            contracts = withdrawData.sort((a, b) => b.wr_date - a.wr_date);
        } else if (type === 'fixed') {
            let contractsData = await model.GetUserContractList(user_id)
            contracts = contractsData.sort((a, b) => b.ui_date - a.ui_date).filter(contract => contract.ui_type.toLowerCase() === 'fixed');
        } else if (type === 'flexible') {
            let contractsData = await model.GetUserContractList(user_id)
            contracts = contractsData.sort((a, b) => b.ui_date - a.ui_date).filter(contract => contract.ui_type.toLowerCase() === 'flexible')
        } else {
            return res.send({
                result: false,
                message: "Invalid type"
            })
        }
        if (contracts.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved successfully",
                data: contracts
            })
        } else {
            return res.send({
                result: false,
                message: "failed to get data"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}