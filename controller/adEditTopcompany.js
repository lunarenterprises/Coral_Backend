var model = require('../model/adEditTopcompany')
var formidable = require('formidable')
var fs = require('fs')

module.exports.EditTopCompany = async (req, res) => {
    try {

        let user_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(user_id, admin_role)
        if (adminData[0]?.ad_role !== 'superadmin') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        let { tc_id, tc_name, tc_current_year, tc_minimum_investment, current_percentage, previous_percentage, tc_current_CAGR, tc_expected_CAGR } = req.body
        if (!tc_id || !tc_name || !current_percentage || !previous_percentage) {
            return res.send({
                result: false,
                messaage: "Company id, name, current percentage and previous percentage are required"
            })
        }
        const growth = current_percentage - previous_percentage
        var checkTopCompany = await model.CheckTopCompanyQuery(tc_id)

        if (checkTopCompany.length > 0) {

            let condition = ``;

            if (tc_name) {
                if (condition == '') {
                    condition = `set tc_name ='${tc_name}' `
                } else {
                    condition += `,tc_name='${tc_name}'`
                }
            }
            if (tc_current_year) {
                if (condition == '') {
                    condition = `set tc_current_year ='${tc_current_year}' `
                } else {
                    condition += `,tc_current_year='${tc_current_year}'`
                }
            }
            if (tc_minimum_investment) {
                if (condition == '') {
                    condition = `set tc_minimum_investment ='${tc_minimum_investment}' `
                } else {
                    condition += `,tc_minimum_investment='${tc_minimum_investment}'`
                }
            }

            if (growth) {
                if (condition == '') {
                    condition = `set tc_growth_percentage ='${growth}' `
                } else {
                    condition += `,tc_growth_percentage='${growth}' `
                }
            }
            if (tc_current_CAGR) {
                if (condition == '') {
                    condition = `set tc_current_CAGR ='${tc_current_CAGR}' `
                } else {
                    condition += `,tc_current_CAGR='${tc_current_CAGR}'`
                }
            }
            if (tc_expected_CAGR) {
                if (condition == '') {
                    condition = `set tc_expected_CAGR ='${tc_expected_CAGR}' `
                } else {
                    condition += `,tc_expected_CAGR='${tc_expected_CAGR}'`
                }
            }
            if (current_percentage) {
                if (condition == '') {
                    condition = `set tc_current_percentage ='${current_percentage}' `
                } else {
                    condition += `,tc_current_percentage='${current_percentage}'`
                }
            }
            if (previous_percentage) {
                if (condition == '') {
                    condition = `set tc_previous_percentage ='${previous_percentage}' `
                } else {
                    condition += `,tc_previous_percentage='${previous_percentage}'`
                }
            }

            if (condition !== '') {
                var EditTopCompany = await model.ChangeTopCompany(condition, tc_id)
            }

            if (EditTopCompany.affectedRows > 0) {
                return res.send({
                    result: true,
                    message: "Current Investment updated successfully"
                })
            } else {
                return res.send({
                    result: false,
                    message: "failed to update Current Investment"
                })
            }

        } else {
            return res.send({
                result: false,
                message: "Current Investment does not exists"
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

