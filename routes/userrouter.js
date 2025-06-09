var express = require('express')
var route = express.Router();

route.post('/register', require('../controller/register').UserRegistration)

route.post('/login', require('../controller/userlogin').Login)

route.post('/forgotpassword/otpsend', require('../controller/forgotpassword').OtpSend)

route.post('/forgotpassword/mailverify', require('../controller/forgotpassword').Emailverification)

route.post('/forgotpassword/changepassword', require('../controller/forgotpassword').ChangePassword)

route.post('/company/investment/list', require('../controller/companyinvestment').CompanyInvestment)

route.post('/company/investment/edit', require('../controller/editcompanyinvestment').EditCompanyInvestment)

route.post('/company/bank/add', require('../controller/AddBank').AddBank)

route.post('/company/bank/list', require('../controller/banklist').BankList)

route.post('/company/bank/delete', require('../controller/deletebank').DeleteBank)

route.post('/company/bank/edit', require('../controller/editBank').EditBank)

route.post('/calculator', require('../controller/calculator').Calculator)

route.post('/form', require('../controller/form').AddForm)

route.post('/invest', require('../controller/Addorder').AddOrder)

route.post('/project/list', require('../controller/projectlist').ProjectList)

route.get('/', require('../controller/users').Users)

route.post('/edit', require('../controller/editProfile').EditUserProfile)

route.post('/updateLanguage', require('../controller/updateLanguage').UpdateLanguage)

route.post('/updateNotification', require('../controller/updateNotification').UpdateNotification)

route.post('/withdrawal', require('../controller/withdraw').Withdraw)

route.post('/news/api', require('../controller/newsview').NewsApi)

route.post('/withdraw/history', require('../controller/withdrawhistory').WithdrawHistory)

route.post('/terminate/contract', require('../controller/terminatecontract').TerminateContract)

route.post('/lock/period', require('../controller/lockperiod').LockPeriod)

route.post('/nominee/list', require('../controller/nomineelist').NomineeList)

route.post('/nominee/add', require('../controller/Addnominee').AddNominee)

route.post('/nominee/delete', require('../controller/DeleteNominee').DeleteNominee)

route.post('/nominee/uploadForm', require('../controller/UploadNomineeForm').uploadNomineeForm)

route.post('/transfer/contract', require('../controller/contracttransfer').ContractTransfer)

route.post('/recent/transaction', require('../controller/recenttransaction').RecentTransaction)

route.post('/performance', require('../controller/performance').Performance)

route.post('/order/sign', require('../controller/order_signing').Order_Sign)

route.post('/lock/period/list', require('../controller/locklist').LockList)

route.post('/invoice/upload', require('../controller/addinvoicefile').AddInvoiceFile)

route.post('/market/insight', require('../controller/marketinsight').MarketInsight)

route.post('/easy-pin/setup', require('../controller/easypinsetup').EasyPin)

route.post('/easy-pin/check', require('../controller/checkeasypin').CheckEasyPin)

route.post('/wfa-pin/check', require('../controller/checkeasypin').WfaCheckEasyPin)

route.post('/easy-pin/change', require('../controller/forgotpassword').ChangePin)

route.post('/wfa-pin/change', require('../controller/forgotpassword').WfaChangePin)

route.post('/kyc-upload', require('../controller/kycupload').KycUpload)

route.post('/kyc/re_upload',require('../controller/kycupload').KycReUpload)

route.get('/kyc', require('../controller/UserKycData').GetUserKycData)

route.post('/contractList', require('../controller/userContractList').UserContractList)

route.get('/hgfs/list', require('../controller/adHgfs').HgfsList)

route.post('/admin/offer/add', require('../controller/offeradd').OfferAdd)

route.get('/offer/list', require('../controller/offerlist').OfferList)

route.post('/offer/delete', require('../controller/offerdelete').OfferDelete)

route.get('/balance/list', require('../controller/balance').Balance)

route.get('/wallet/transaction/list', require('../controller/wallettransaction').WalletTransaction)

route.post('/nestegg/addamount', require('../controller/nestegg').NestEggs)

route.get('/nestegg/list', require('../controller/nestegglist').NestEggList)

route.get('/nest/currentInvestment', require('../controller/currentInvestment').currentInvestment)

route.get('/notifications', require('../controller/ListNotification').GetNotification)

route.get('/download/statement/profit', require('../controller/ProfitStatement').downloadStatementPdf)

route.post('/download/statement/wallet', require('../controller/WalletStatement').downloadStatementPdf)

route.post('/download/statement/activities', require('../controller/ActivityStatement').downloadStatementPdf)

route.post('/activities', require('../controller/activities').Activities)

route.post('/addReferral', require('../controller/adddReferral').AddReferral)

route.post('/cwiInvestment', require('../controller/cwiInvestment').cwiInvestment)

route.get('/faq', require('../controller/getFaq').GetFaq)

route.get('/cwiInvestments', require('../controller/cwiInvestmentsList').cwiInvestmentList)

route.get('/list/futureInvestments', require('../controller/adFutureInvestments').FutureInvestmentList)

route.post('/ticket/create', require('../controller/ticket').CreateTicket)

route.get('/ticket/list', require('../controller/ticket').ListTickets)

route.put('/ticket/edit', require('../controller/ticket').EditTicket)

route.delete('/ticket/delete', require('../controller/ticket').DeleteTicket)

route.post('/google/login', require('../controller/GoogleAuth').GoogleLogin)

route.post('/message/sendMessage', require('../controller/userMessages').SendMessage)

route.post('/message/listMessages', require('../controller/userMessages').ListMessages)

route.post('/top_company', require('../controller/top_company').ListTopCompany)

route.post('/future_options/invest', require('../controller/InvestFutureOptions').InvestFututreOptions)

route.post('/upload/paymentreceipt', require('../controller/uploadPaymentReceipt').UploadPaymentReceipt)

route.post('/industry-growth',require('../controller/industryGrowth').GetIndustryGrowth)


/// Payment Routes
route.post('/createPayment', require('../controller/payment').createClientSecret)

route.post('/paymentstatus/update', require('../controller/payment').UpdatePaymentStatus)

route.get('/paymentDetails', require('../controller/payment').getPaymentDetails)

module.exports = route;