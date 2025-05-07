var model = require('../model/adFutureInvestments')
let userModel = require('../model/users')
let notification = require('../util/saveNotification')

// let { SendMessage } = require('../util/firebaseConfig')

module.exports.FutureInvestmentList = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User Id is required"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length === 0) {
            return res.send({
                result: false,
                message: "User is not found"
            })
        }
        let FutureInvestmentList = await model.GetFutureInvestmentList()
        // await SendMessage(user_id, "Fetch FAQ", "Fetched FAQ Successfully.!")
        if (FutureInvestmentList.length === 0) {
            return res.send({
                result: false,
                message: "Future Investment List not found"
            })
        } else {
            return res.send({
                result: true,
                message: "Data retrived successfully",
                data: FutureInvestmentList
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }


}

module.exports.AddFutureInvestment = async (req, res) => {
    try {
        let user_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(user_id)
        if (adminData[0]?.fi_minimum_investment == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }
        var { fi_industries, fi_plan_to_invest, fi_expected_return, fi_minimum_investment } = req.body
        if (!fi_industries || !fi_plan_to_invest || !fi_expected_return || !fi_minimum_investment) {
            return res.send({
                result: false,
                message: "insufficent parameter"
            })
        }
        await notification.addNotification(user_id, admin_role, `New Future Investment Details added`, `Future Investment Details about ${fi_industries} added `)

        let addFutureInvestment = await model.AddFutureInvestmentQuery(fi_industries, fi_plan_to_invest, fi_expected_return, fi_minimum_investment)

        if (addFutureInvestment.affectedRows > 0) {

            return res.send({
                result: true,
                message: "Future Investment added successfully"
            });

        } else {
            return res.send({
                result: true,
                message: "failed to add Future Investment "
            })
        }


    } catch (error) {
        console.log(error);
        return res.send({
            result: false,
            message: error.message,
        });
    }

}

module.exports.EditFutureInvestment = async (req, res) => {
    try {

        let user_id = req.user.admin_id
        // let admin_role = req.user.role

        var adminData = await model.getAdmin(user_id)
        if (adminData[0]?.u_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        let { fi_id, fi_industries, fi_plan_to_invest, fi_expected_return, fi_minimum_investment } = req.body

        if (!fi_id) {
            return res.send({
                result: false,
                messaage: "insufficient parameter"
            })
        }
        var checkFutureInvestment = await model.GetFutureInvestmentList(fi_id)

        if (checkFutureInvestment.length > 0) {

            let condition = ``;

            if (fi_industries) {
                if (condition == '') {
                    condition = `set fi_industries ='${fi_industries}' `
                } else {
                    condition += `,fi_industries='${fi_industries}'`
                }
            }
            if (fi_plan_to_invest) {
                if (condition == '') {
                    condition = `set fi_plan_to_invest ='${fi_plan_to_invest}' `
                } else {
                    condition += `,fi_plan_to_invest='${fi_plan_to_invest}'`
                }
            }
            if (fi_expected_return) {
                if (condition == '') {
                    condition = `set fi_expected_return ='${fi_expected_return}' `
                } else {
                    condition += `,fi_expected_return='${fi_expected_return}'`
                }
            }

            if (fi_minimum_investment) {
                if (condition == '') {
                    condition = `set fi_minimum_investment ='${fi_minimum_investment}' `
                } else {
                    condition += `,fi_minimum_investment='${fi_minimum_investment}'`
                }
            }


            if (condition !== '') {
                var EditFutureInvestment = await model.ChangeFutureInvestment(condition, fi_id)
            }
            if (EditFutureInvestment.affectedRows > 0) {

                return res.send({
                    result: true,
                    message: "Future Investment updated successfully"
                })
            } else {
                return res.send({
                    result: false,
                    message: "failed to update Future Investment"
                })
            }

        } else {
            return res.send({
                result: false,
                message: "Future Investment does not exists"
            })
        }


    } catch
    (error) {
        return res.send({
            result: false,
            message: error.message
        })

    }
}
