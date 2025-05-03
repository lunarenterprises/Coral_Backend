var model = require("../model/admindeletesection");
let notification = require('../util/saveNotification')


module.exports.AdminDeleteSection = async (req, res) => {

    try {

        let admin_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(admin_id, admin_role)
        if (adminData[0]?.u_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        var tc_id = req.body.tc_id;
        var subadmin_id = req.body.subadmin_id;
        var invest_id = req.body.invest_id;
        var withdraw_id = req.body.withdraw_id;
        var invester_id = req.body.invester_id;
        var hgfs_id = req.body.hgfs_id;
        var fi_id = req.body.fi_id;




        if (invester_id) {
            let checkinvester = await model.CheckInvesterQuery(invester_id);

            var username = checkinvester[0]?.u_name
            if (checkinvester.length == 0) {
                return res.send({
                    result: false,
                    message: "invester not found"
                });
            } else {
                let data = await notification.addNotification(admin_id, `${admin_role}`, "User Removed", `User [${username}] Removed deleted successfully`)
                var deletesection = await model.RemoveInvesterQuery(invester_id);

            }
        }

        if (tc_id) {
            let checkpartners = await model.CheckTopcompanyQuery(tc_id);

            var companyname = checkpartners[0]?.tc_name
            if (checkpartners.length == 0) {
                return res.send({
                    result: false,
                    message: "Top company details not found"
                });
            } else {
                let data = await notification.addNotification(admin_id, `${admin_role}`, "Top company Deleted", `Top company [${companyname}] deleted successfully`)
                var deletesection = await model.RemoveTopcompanyQuery(tc_id);

            }
        }

        if (subadmin_id) {
            let checksubadmin = await model.CheckSubAdminQuery(subadmin_id);

            var adminname = checksubadmin[0]?.u_name
            if (checksubadmin.length == 0) {
                return res.send({
                    result: false,
                    message: "Subadmin not found"
                });
            } else {
                await notification.addNotification(admin_id, `${admin_role}`, "Subadmin Removed", `Subadmin [${adminname}] removed successfully`)

                var deletesection = await model.RemoveSubAdminQuery(subadmin_id);

            }
        }

        if (invest_id) {
            let checkinvest = await model.CheckInvestQuery(invest_id);

            // var username = checkinvest[0]?.ui_id
            if (checkinvest.length == 0) {
                return res.send({
                    result: false,
                    message: "invest not found"
                });
            } else {
                await notification.addNotification(admin_id, `${admin_role}`, "Invest details Removed", `Invest details of [${invest_id}] removed successfully`)

                var deletesection = await model.RemoveInvestQuery(invest_id);

            }
        }

        if (withdraw_id) {
            let checkwithdraw = await model.CheckWithdrawQuery(withdraw_id);

            // var username = checkinvest[0]?.ui_id
            if (checkwithdraw.length == 0) {
                return res.send({
                    result: false,
                    message: "invest not found"
                });
            } else {
                await notification.addNotification(admin_id, `${admin_role}`, "Withdraw Request Removed", `Withdraw Request of [${withdraw_id}] removed successfully`)

                var deletesection = await model.RemoveWithdrawQuery(withdraw_id);

            }
        }

        if (hgfs_id) {
            let checkHGFS = await model.CheckHGFSQuery(hgfs_id);

            // var username = checkinvest[0]?.ui_id
            if (checkHGFS.length == 0) {
                return res.send({
                    result: false,
                    message: "HGFS Details not found"
                });
            } else {
                await notification.addNotification(admin_id, `${admin_role}`, "HGFS Details Removed", `HGFS Details of [${hgfs_id}] removed successfully`)

                var deletesection = await model.RemoveHGFSQuery(hgfs_id);

            }
        }

        if (fi_id) {
            let checkFutureInvestment = await model.CheckFutureInvestmentQuery(fi_id);

            // var username = checkinvest[0]?.ui_id
            if (checkFutureInvestment.length == 0) {
                return res.send({
                    result: false,
                    message: "Future Investment Details not found"
                });
            } else {
                await notification.addNotification(admin_id, `${admin_role}`, "Future Investment Details Removed", `Future Investment Details of [${fi_id}] removed successfully`)

                var deletesection = await model.RemoveFutureInvestmentQuery(fi_id);

            }
        }

        if (deletesection.affectedRows > 0) {
            return res.send({
                result: true,
                message: "delete successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "failed to delete"
            })
        }

    } catch (error) {
        console.log(error);

        return res.send({
            result: false,
            message: error.message
        })

    }

}