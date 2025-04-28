var model = require('../model/currentInvestment')
let notification = require('../util/saveNotification')
let userModel = require('../model/users')

module.exports.cwiInvestmentList = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: 'user_id is required'
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length == 0) {
            return res.send({
                result: false,
                message: 'user not found'
            })
        }
        let cwiList = await model.getCWIIvestments(user_id)
        console.log("cwi list : ", cwiList)
        // let updatedData = cwiList.map(item => {
        //     return {
        //         id: item.tc_id,
        //         name: item.tc_name,
        //         totalAmount: item.tc_current_year,
        //         return_value: item.tc_growth_percentage,
        //     }
        // })
        if (cwiList.length > 0) {
            await notification.addNotification(user_id, userData[0].u_role, "CWI_Investment List", "User has checked cwi investment list", "success")
            return res.send({
                result: true,
                message: "Data retrived successfully",
                data: cwiList
            })
        } else {
            return res.send({
                result: false,
                message: "no data found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
