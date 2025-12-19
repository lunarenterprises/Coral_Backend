var express = require('express')
var route = express.Router();

const { verifyToken } = require('../componets/jwt')

route.post('/register', require('../controller/register').UserRegistration)

route.post('/verify_otp', require('../controller/verify_otp').VerifyOtp)

route.post('/login', require('../controller/userlogin').Login)

route.post('/forgotpassword/otpsend', require('../controller/forgotpassword').OtpSend)

route.post('/forgotpassword/mailverify', require('../controller/forgotpassword').Emailverification)

route.post('/forgotpassword/changepassword', require('../controller/forgotpassword').ChangePassword)

route.post('/company/investment/list', require('../controller/companyinvestment').CompanyInvestment)

route.post('/company/investment/edit', require('../controller/editcompanyinvestment').EditCompanyInvestment)

route.post('/company/bank/add',verifyToken, require('../controller/AddBank').AddBank)

route.post('/company/bank/list',verifyToken, require('../controller/banklist').BankList)

route.post('/company/bank/delete',verifyToken, require('../controller/deletebank').DeleteBank)

route.post('/company/bank/edit',verifyToken, require('../controller/editBank').EditBank)

route.post('/calculator', require('../controller/calculator').Calculator)

route.post('/form', require('../controller/form').AddForm)

route.post('/invest',verifyToken, require('../controller/Addorder').AddOrder)

route.post('/project/list', require('../controller/projectlist').ProjectList)

route.get('/',verifyToken, require('../controller/users').Users)

route.post('/edit',verifyToken, require('../controller/editProfile').EditUserProfile)

route.post('/updateLanguage',verifyToken, require('../controller/updateLanguage').UpdateLanguage)

route.post('/updateNotification',verifyToken, require('../controller/updateNotification').UpdateNotification)

route.post('/withdrawal', verifyToken,require('../controller/withdraw').Withdraw)

route.post('/news/api', require('../controller/newsview').NewsApi)

route.post('/withdraw/history',verifyToken, require('../controller/withdrawhistory').WithdrawHistory)

route.post('/terminate/contract',verifyToken, require('../controller/terminatecontract').TerminateContract)

route.post('/lock/period',verifyToken, require('../controller/lockperiod').LockPeriod)

route.post('/nominee/list',verifyToken, require('../controller/nomineelist').NomineeList)

route.post('/nominee/add',verifyToken, require('../controller/Addnominee').AddNominee)

route.post('/nominee/delete', verifyToken, require('../controller/DeleteNominee').DeleteNominee)

route.post('/nominee/uploadForm',verifyToken, require('../controller/UploadNomineeForm').uploadNomineeForm)

route.post('/transfer/contract',verifyToken, require('../controller/contracttransfer').ContractTransfer)

route.post('/recent/transaction',verifyToken, require('../controller/recenttransaction').RecentTransaction)

route.post('/performance',verifyToken, require('../controller/performance').Performance)

route.post('/order/sign',verifyToken, require('../controller/order_signing').Order_Sign)

route.post('/lock/period/list',verifyToken, require('../controller/locklist').LockList)

route.post('/invoice/upload',verifyToken, require('../controller/addinvoicefile').AddInvoiceFile)

route.post('/market/insight', require('../controller/marketinsight').MarketInsight)

route.post('/easy-pin/setup',verifyToken, require('../controller/easypinsetup').EasyPin)

route.post('/easy-pin/check',verifyToken, require('../controller/checkeasypin').CheckEasyPin)

route.post('/wfa-pin/check',verifyToken, require('../controller/checkeasypin').WfaCheckEasyPin)

route.post('/easy-pin/change', require('../controller/forgotpassword').ChangePin)

route.post('/wfa-pin/change', require('../controller/forgotpassword').WfaChangePin)

route.post('/kyc-upload',verifyToken, require('../controller/kycupload').KycUpload)

route.post('/kyc/re_upload',verifyToken, require('../controller/kycupload').KycReUpload)

route.get('/kyc',verifyToken, require('../controller/UserKycData').GetUserKycData)

route.post('/contractList',verifyToken, require('../controller/userContractList').UserContractList)

route.get('/hgfs/list',verifyToken, require('../controller/adHgfs').HgfsList)

route.post('/admin/offer/add', require('../controller/offeradd').OfferAdd)

route.get('/offer/list', require('../controller/offerlist').OfferList)

route.post('/offer/delete', require('../controller/offerdelete').OfferDelete)

route.get('/balance/list',verifyToken, require('../controller/balance').Balance)

route.get('/wallet/transaction/list',verifyToken, require('../controller/wallettransaction').WalletTransaction)

route.post('/nestegg/addamount',verifyToken, require('../controller/nestegg').NestEggs)

route.get('/nestegg/list',verifyToken, require('../controller/nestegglist').NestEggList)

route.get('/nest/currentInvestment',verifyToken, require('../controller/currentInvestment').currentInvestment)

route.get('/notifications',verifyToken, require('../controller/ListNotification').GetNotification)

route.get('/download/statement/profit',verifyToken, require('../controller/ProfitStatement').downloadStatementPdf)

route.post('/download/statement/wallet',verifyToken, require('../controller/WalletStatement').downloadStatementPdf)

route.post('/download/statement/activities',verifyToken, require('../controller/ActivityStatement').downloadStatementPdf)

route.post('/activities',verifyToken, require('../controller/activities').Activities)

route.post('/addReferral',verifyToken, require('../controller/adddReferral').AddReferral)

route.post('/cwiInvestment',verifyToken, require('../controller/cwiInvestment').cwiInvestment)

route.get('/faq',verifyToken, require('../controller/getFaq').GetFaq)

route.get('/cwiInvestments',verifyToken, require('../controller/cwiInvestmentsList').cwiInvestmentList)

route.get('/list/futureInvestments',verifyToken, require('../controller/adFutureInvestments').FutureInvestmentList)

route.post('/ticket/create',verifyToken, require('../controller/ticket').CreateTicket)

route.get('/ticket/list',verifyToken, require('../controller/ticket').ListTickets)

route.put('/ticket/edit',verifyToken, require('../controller/ticket').EditTicket)

route.delete('/ticket/delete',verifyToken, require('../controller/ticket').DeleteTicket)

route.post('/google/login', require('../controller/GoogleAuth').GoogleLogin)

route.post('/message/sendMessage',verifyToken, require('../controller/userMessages').SendMessage)

route.post('/message/listMessages',verifyToken, require('../controller/userMessages').ListMessages)

route.post('/top_company',verifyToken, require('../controller/top_company').ListTopCompany)

route.post('/future_options/invest',verifyToken, require('../controller/InvestFutureOptions').InvestFututreOptions)

route.post('/upload/paymentreceipt',verifyToken, require('../controller/uploadPaymentReceipt').UploadPaymentReceipt)

route.post('/industry-growth',verifyToken, require('../controller/industryGrowth').GetIndustryGrowth)

route.post('/list/status', require('../controller/status').ListAllStatus)

route.post('/assign/nominee', verifyToken,require('../controller/Addnominee').AssignNominee)

route.get('/return_chart',verifyToken, require('../controller/users').GetReturnChart)


/// Payment Routes
route.post('/createPayment',verifyToken, require('../controller/payment').createClientSecret)

route.post('/paymentstatus/update',verifyToken, require('../controller/payment').UpdatePaymentStatus)

route.get('/paymentDetails',verifyToken, require('../controller/payment').getPaymentDetails)

module.exports = route;