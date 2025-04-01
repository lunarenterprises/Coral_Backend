var model = require('../model/adEditinvestmentShare')

module.exports.EditSharedilution = async (req, res) => {
    try {

        let user_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(user_id, admin_role)
        if (adminData[0]?.u_role !== 'superadmin') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        let { invest_id, number_of_shares, share_value } = req.body

        if (!invest_id) {
            return res.send({
                result: false,
                messaage: "insufficient parameter"
            })
        }
        var checksharedilution = await model.CheckSharedilutionQuery(invest_id)
        console.log(checksharedilution);

        if (checksharedilution.length > 0) {

            let condition = ``;

            if (number_of_shares) {
                if (condition == '') {
                    condition = `set ui_number_of_shares ='${number_of_shares}' `
                } else {
                    condition += `,ui_number_of_shares='${number_of_shares}'`
                }
            }
            if (share_value) {
                if (condition == '') {
                    condition = `set ui_share_value ='${share_value}' `
                } else {
                    condition += `,ui_share_value='${share_value}'`
                }
            }


            if (condition !== '') {
                var Editsharedilution = await model.ChangeSharedilution(condition, invest_id)
            }
            if (Editsharedilution.affectedRows > 0) {

                return res.send({
                    result: true,
                    message: "investment shares dilutions updated successfully"
                })
            } else {
                return res.send({
                    result: false,
                    message: "failed to update investment shares dilutions"
                })
            }

        } else {
            return res.send({
                result: false,
                message: "investment details does not exists"
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


module.exports.EditInvestmentCalculater = async (req, res) => {
    try {

        let user_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(user_id, admin_role)
        if (adminData[0]?.u_role !== 'superadmin') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        let { ri_id, ri_project, ri_amount_from, ri_amount_to, ri_return_year, ri_return_month, ri_wf, ri_duration, ri_no_of_shares, ri_profit, ri_security, ri_payout_amount } = req.body

        if (!ri_id) {
            return res.send({
                result: false,
                messaage: "insufficient parameter"
            })
        }
        var checksharedilution = await model.CheckInvestmentCalculaterQuery(ri_id)
        console.log(checksharedilution);

        if (checksharedilution.length > 0) {

            let condition = ``;

            if (ri_project) {
                if (condition == '') {
                    condition = `set ri_project ='${ri_project}' `
                } else {
                    condition += `,ri_project='${ri_project}'`
                }
            }
            if (ri_amount_from) {
                if (condition == '') {
                    condition = `set ri_amount_from ='${ri_amount_from}' `
                } else {
                    condition += `,ri_amount_from='${ri_amount_from}'`
                }
            }
            if (ri_amount_to) {
                if (condition == '') {
                    condition = `set ri_amount_to ='${ri_amount_to}' `
                } else {
                    condition += `,ri_amount_to='${ri_amount_to}'`
                }
            }

            if (ri_return_year) {
                if (condition == '') {
                    condition = `set ri_return_year ='${ri_return_year}' `
                } else {
                    condition += `,ri_return_year='${ri_return_year}'`
                }
            }


            if (ri_return_month) {
                if (condition == '') {
                    condition = `set ri_return_month ='${ri_return_month}' `
                } else {
                    condition += `,ri_return_month='${ri_return_month}'`
                }
            }

            if (ri_wf) {
                if (condition == '') {
                    condition = `set ri_wf ='${ri_wf}' `
                } else {
                    condition += `,ri_wf='${ri_wf}'`
                }
            }
            if (ri_duration) {
                if (condition == '') {
                    condition = `set ri_duration ='${ri_duration}' `
                } else {
                    condition += `,ri_duration='${ri_duration}'`
                }
            }
            if (ri_no_of_shares) {
                if (condition == '') {
                    condition = `set ri_no_of_shares ='${ri_no_of_shares}' `
                } else {
                    condition += `,ri_no_of_shares='${ri_no_of_shares}'`
                }
            }
            if (ri_profit) {
                if (condition == '') {
                    condition = `set ri_profit ='${ri_profit}' `
                } else {
                    condition += `,ri_profit='${ri_profit}'`
                }
            }
            if (ri_security) {
                if (condition == '') {
                    condition = `set ri_security ='${ri_security}' `
                } else {
                    condition += `,ri_security='${ri_security}'`
                }
            }
            if (ri_payout_amount) {
                if (condition == '') {
                    condition = `set ri_payout_amount ='${ri_payout_amount}' `
                } else {
                    condition += `,ri_payout_amount='${ri_payout_amount}'`
                }
            }


            if (condition !== '') {
                var EditInvestmentCalculater = await model.ChangeInvestmentCalculater(condition, ri_id)
            }
            if (EditInvestmentCalculater.affectedRows > 0) {

                return res.send({
                    result: true,
                    message: "investment calculator details updated successfully"
                })
            } else {
                return res.send({
                    result: false,
                    message: "failed to update investment calculator details"
                })
            }

        } else {
            return res.send({
                result: false,
                message: "investment calculator details does not exists"
            })
        }


    } catch
    (error) {
        console.log(error);

        return res.send({
            result: false,
            message: error.message
        })

    }
}
