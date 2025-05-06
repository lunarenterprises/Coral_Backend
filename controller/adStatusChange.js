var model = require('../model/adStatusChange');
var notification = require('../util/saveNotification')
var moment = require('moment')

module.exports.StatusChange = async (req, res) => {

    try {

        let admin_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.CheckAdmin(admin_id, admin_role)
        if (adminData[0]?.u_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }
        var currentdate = moment().format('YYYY-MM-DD')
        var { contract_status, contract_id, activate_admin_id, activate_admin_status, activate_user_id, activate_user_status, activate_admin_id, invest_req_id, invest_req_status, payout_id, payout_status, payout_amount, withdrawel_status, withdrawel_id, withdraw_amount, kyc_status, kyc_user_id, kyc_message, pay_invest_id, pay_invest_status } = req.body


        if (contract_status && contract_id) {

            var getcontract = await model.GetContract(contract_id)
            if (getcontract.length > 0) {
                var previous_status = getcontract[0]?.ui_status

                await notification.addNotification(admin_id, `${admin_role}`, "Contract status changed", `Contract status changed from ${previous_status} to ${contract_status}`)

                let changecontractstatus = await model.ChangeContractStatus(contract_status, contract_id)

                if (changecontractstatus.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "Contract Status Updated Sucessfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to Update Contract Status"
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "Failed to get Contract Details"
                })
            }
        }

        if (activate_user_id && activate_user_status) {

            var getuser = await model.GetUser(activate_user_id)
            if (getuser.length > 0) {
                var previous_status = getuser[0]?.u_status
                await notification.addNotification(admin_id, `${admin_role}`, `Verifying user ${getuser[0]?.u_name}`, `User status verifiyed from ${previous_status} to active`)

                let changeuserstatus = await model.ChangeUserStatus(activate_user_status, activate_user_id)

                if (changeuserstatus.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "User Status Updated Sucessfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to Update User Status"
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "Failed to get user Details"
                })
            }
        }

        if (activate_admin_id && activate_admin_status) {

            var getuser = await model.GetAdmin(activate_admin_id)
            if (getuser.length > 0) {
                var previous_status = getuser[0]?.ad_status
                await notification.addNotification(admin_id, `${admin_role}`, `Verifying admin ${getuser[0]?.ad_name}`, `Admin status verifiyed from ${previous_status} to active`)

                let changeuserstatus = await model.ChangeAdminStatus(activate_admin_status, activate_admin_id)

                if (changeuserstatus.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "User Status Updated Sucessfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to Update User Status"
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "Failed to get user Details"
                })
            }
        }

        if (activate_admin_id) {

            var getuser = await model.GetUser(activate_admin_id)
            if (getuser.length > 0) {
                var previous_status = getuser[0]?.u_status
                var role = getuser[0]?.u_role

                let activate_admin_status = 'active'

                await notification.addNotification(admin_id, `${admin_role}`, `Verifying ${role} ${getuser[0]?.u_name}`, `User status verifiyed from ${previous_status} to active`)

                let changeuserstatus = await model.ChangeUserStatus(activate_admin_status, activate_admin_id)

                if (changeuserstatus.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "subadmin Status Updated Sucessfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to Update subadmin Status"
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "Failed to get subadmin Details"
                })
            }
        }


        if (invest_req_id && invest_req_status) {

            var getinvest = await model.GetContract(invest_req_id)
            if (getinvest.length > 0) {
                var previous_status = getinvest[0]?.ui_request_status
                let request = getinvest[0]?.ui_request
                let nominee_id = getinvest[0]?.ui_nominee_id

                await notification.addNotification(admin_id, `${admin_role}`, `Invest Request ${invest_req_status} `, `Invest Request status updated from ${previous_status} to ${invest_req_status}`)

                let changeInveststatus = await model.ChangeInvestReqStatus(invest_req_status, invest_req_id)

                if (changeInveststatus.affectedRows > 0) {

                    if (request == 'termination') {
                        var removecontract = await model.RemoveInvestQuery(invest_req_id);
                    }
                    if (request == 'transfer') {
                        var transfercontract = await model.TransferInvestQuery(nominee_id, invest_req_id);
                    }

                    return res.send({
                        result: true,
                        message: "Invest Request Status Updated Sucessfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to Update Invest Request Status"
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "Failed to get Invest Request Details"
                })
            }
        }

        if (payout_id && payout_status && payout_amount) {

            var getpayout = await model.GetPayout(payout_id)
            if (getpayout.length > 0) {
                var previous_status = getpayout[0]?.ph_status
                var user_id = getpayout[0]?.ph_invest_u_id
                var contract_type = getpayout[0]?.ph_invest_type

                await notification.addNotification(admin_id, `${admin_role}`, `Payout Status updation for Id ${payout_id} `, `Payout Status  updated from ${previous_status} to ${payout_status}`)

                let changepayoutstatus = await model.ChangePayoutStatus(payout_status, payout_id)
                let addwalletamount = await model.AddWalletAmount(payout_amount, user_id)

                await notification.addNotification(user_id, `user`, `Payout amount added to user[${user_id}] wallet`, `Payout amount ${payout_amount} added to user[${user_id}] wallet`)

                let addwallethistory = await model.AddWalletHistory(user_id, contract_type, payout_amount, currentdate)


                if (changepayoutstatus.affectedRows > 0 && addwalletamount.affectedRows > 0 && addwallethistory.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "Payout Status Updated Sucessfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to Update Payout Status"
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "Failed to get Payout Details"
                })
            }
        }


        if (withdrawel_status && withdrawel_id && withdraw_amount) {

            var getwithdrawel = await model.GetWithdrawel(withdrawel_id)
            if (getwithdrawel.length > 0) {
                var previous_status = getwithdrawel[0]?.wr_action_status
                var user_id = getwithdrawel[0]?.wr_u_id



                await notification.addNotification(admin_id, `${admin_role}`, `Withdrawel Request updated for id ${withdrawel_id} `, `Withdrawel Request status updated from ${previous_status} to ${withdrawel_status}`)
                let changewallet = await model.UpdateWallet(withdraw_amount, user_id)
                await notification.addNotification(user_id, `user`, `User ${user_id} withdra from Wallet`, `withdraw sucessfully ${withdraw_amount} from user[ ${user_id}] wallet`)

                let changeInveststatus = await model.ChangeWithdrawelStatus(withdrawel_status, withdrawel_id)

                if (changeInveststatus.affectedRows > 0 && changewallet.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "Withdrawel Request Status Updated Sucessfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to Update Withdrawel Request Status"
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "Failed to get Withdrawel Request Details"
                })
            }
        }

        if (kyc_status && kyc_user_id || kyc_message) {

            var getuser = await model.GetUser(kyc_user_id)
            if (getuser.length > 0) {
                var previous_status = getuser[0]?.u_kyc


                await notification.addNotification(admin_id, `${admin_role}`, `KYC status updated for user ${kyc_user_id} `, `KYC status updated from ${previous_status} to ${kyc_status}`)
                if (kyc_status == 'verified') {
                    var changeBankstatus = await model.ChangeBankStatus(kyc_user_id)

                    var changekycstatus = await model.ChangeKycStatus(kyc_status, kyc_user_id)

                } else {
                    var addkycmessage = await model.AddKycMessage(kyc_message, kyc_user_id)

                    var changekycstatus = await model.ChangeKycStatus(kyc_status, kyc_user_id)

                }

                if (changekycstatus.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "KYC Status Updated Sucessfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to Update KYC status"
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "Failed to get user Details"
                })
            }
        }


        if (pay_invest_id && pay_invest_status) {

            var getinvest = await model.GetContract(pay_invest_id)
            if (getinvest.length > 0) {
                var previous_status = getinvest[0]?.ui_payment_status


                await notification.addNotification(admin_id, `${admin_role}`, `Investment Payment Status updated for id ${pay_invest_id} `, `Investment Payment Status updated  from ${previous_status} to ${pay_invest_status}`)

                let changeInveststatus = await model.ChangeInvestPatmentStatus(pay_invest_id, pay_invest_status)

                if (changeInveststatus.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "Investment Payment Status updated Sucessfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to Update Investment Payment Status "
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "Failed to get Investment Details"
                })
            }
        }

    } catch (error) {

        return res.send({
            result: false,
            message: error.message
        })

    }

}