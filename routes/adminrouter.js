var express = require('express')
var route = express.Router();
var { verifyToken } = require('../componets/jwt')

route.post('/add/top-company', verifyToken, require('../controller/addtopcompany').AddTopCompany)

route.post('/list/top-company', verifyToken, require('../controller/listtopcompany').ListTopcompany)

route.post('/edit/top-company', verifyToken, require('../controller/adEditTopcompany').EditTopCompany)

route.post('/deletesection', verifyToken, require('../controller/admindeletesection').AdminDeleteSection)

route.post('/login', require('../controller/adminlogin').AdminLogin)

route.post('/subadmin-list', verifyToken, require('../controller/adminlist').AdminList)

route.post('/add/subadmin', verifyToken, require('../controller/addsubadmin').AddSubAdmin)

route.post('/edit/subadmin', verifyToken, require('../controller/editsubadmin').EditSubAdmin)

route.post('/list/contracts', verifyToken, require('../controller/adContractList').ContractList)

route.post('/list/withdraw_request', verifyToken, require('../controller/adWithdrawList').WithdrawRequestList)

route.post('/list/investers', verifyToken, require('../controller/adInvesterList').InvestersList)

route.post('/list/investers-bank', verifyToken, require('../controller/adInvesterbankdetails').InvesterBankDetails)

route.post('/list/wallet', verifyToken, require('../controller/adwalletlist').WalletList)

route.post('/update/status', verifyToken, require('../controller/adStatusChange').StatusChange)

route.get('/list/nestegg', verifyToken, require('../controller/adNestEggList').NestEggList)

route.post('/add/investment-calculator', verifyToken, require('../controller/adInvestmentCalculater').AddInvestmentCalculater)

route.get('/list/investment-calculator', verifyToken, require('../controller/adListInvestmentCalculater').InvestmentCalculaterList)

route.post('/list/history', verifyToken, require('../controller/adHistory').History)

route.post('/dashboard', verifyToken, require('../controller/adDashboard').Dashboard)



route.get('/ticket/list', verifyToken, require('../controller/adminTickets').ListAllTickets)

route.put('/ticket/edit', verifyToken, require('../controller/adminTickets').EditTicket)

route.delete('/ticket/delete', verifyToken, require('../controller/adminTickets').DeleteTicket)



route.get('/payout-history', verifyToken, require('../controller/adPayoutHistory').PayoutHistory)

route.post('/edit/share-dilution', verifyToken, require('../controller/adEditinvestmentShare').EditSharedilution)

route.post('/edit/investment-calculator', verifyToken, require('../controller/adEditinvestmentShare').EditInvestmentCalculater)

route.get('/download/contract', verifyToken, require('../controller/adContractDownload').ContractDownload)



// route.post('/payout', require('../controller/adPayoutCycle').PayoutCycle)

// route.post('/next-payout', require('../controller/adPayoutCycle').CheckAndCreateNextPayout)

// route.post('/payout_status', require('../controller/adPayoutCycle').CheckAndUpdatePayoutStatus)



route.post('/message/listMessages',verifyToken,require("../controller/adminMessage").ListMessages)
route.post('/message/sendMessage',verifyToken,require("../controller/adminMessage").SendMessage)
route.put('/message/updateMessage',verifyToken,require('../controller/adminMessage').UpdateAdminId)





module.exports = route