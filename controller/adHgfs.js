var model = require("../model/adHgfs");
let notification = require('../util/saveNotification')


module.exports.AddHGFS = async (req, res) => {
    try {
        let user_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(user_id, admin_role)
        if (adminData[0]?.ad_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }
        var { h_industry, h_previous_years, h_last_year, h_growth } = req.body
        if (!h_industry || !h_previous_years || !h_last_year || !h_growth) {
            return res.send({
                result: false,
                message: "insufficent parameter"
            })
        }
        await notification.addNotification(user_id, admin_role, `New HGFS Details added`, `HGFS Details about ${h_industry} added `)

        let addHGFS = await model.AddHGFSQuery(h_industry, h_previous_years, h_last_year, h_growth)

        if (addHGFS.affectedRows > 0) {

            return res.send({
                result: true,
                message: "HGFS added successfully"
            });

        } else {
            return res.send({
                result: true,
                message: "failed to add HGFS "
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

module.exports.HgfsList = async (req, res) => {
    try {
        let { user_id } = req.user
        let own_shares = 0
        let share_prices = 0
        let hgfsList = await model.GetHgfs()
        var getbalance = await model.Getbalance(user_id)
        var userinvest = await model.GetUserInvest(user_id)
        own_shares = userinvest.length
        userinvest.forEach(element => {
            share_prices += element.ui_amount
        });
        if (hgfsList.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                currency: getbalance[0]?.u_currency,
                user_status: getbalance[0]?.u_status,
                user_kyc: getbalance[0]?.u_kyc,
                balance: getbalance[0]?.u_returned_amount,
                own_shares: own_shares,
                share_prices: share_prices,
                data: hgfsList,

            })
        } else {
            return res.send({
                result: false,
                message: "hgfs not found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }


}


module.exports.EditHGFS = async (req, res) => {
    try {

        let user_id = req.user.admin_id
        // let admin_role = req.user.role

        var adminData = await model.getAdmin(user_id)
        if (adminData[0]?.ad_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        let { h_id, h_industry, h_previous_years, h_last_year, h_growth } = req.body

        if (!h_id) {
            return res.send({
                result: false,
                messaage: "insufficient parameter"
            })
        }
        var checkHGFS = await model.GetHgfs(h_id)

        if (checkHGFS.length > 0) {

            let condition = ``;

            if (h_industry) {
                if (condition == '') {
                    condition = `set h_industry ='${h_industry}' `
                } else {
                    condition += `,h_industry='${h_industry}'`
                }
            }
            if (h_previous_years) {
                if (condition == '') {
                    condition = `set h_previous_years ='${h_previous_years}' `
                } else {
                    condition += `,h_previous_years='${h_previous_years}'`
                }
            }
            if (h_last_year) {
                if (condition == '') {
                    condition = `set h_last_year ='${h_last_year}' `
                } else {
                    condition += `,h_last_year='${h_last_year}'`
                }
            }

            if (h_growth) {
                if (condition == '') {
                    condition = `set h_growth ='${h_growth}' `
                } else {
                    condition += `,h_growth='${h_growth}'`
                }
            }


            if (condition !== '') {
                var EditHGFS = await model.ChangeHGFS(condition, h_id)
            }
            if (EditHGFS.affectedRows > 0) {

                return res.send({
                    result: true,
                    message: "HGFS updated successfully"
                })
            } else {
                return res.send({
                    result: false,
                    message: "failed to update HGFS"
                })
            }

        } else {
            return res.send({
                result: false,
                message: "HGFS does not exists"
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

