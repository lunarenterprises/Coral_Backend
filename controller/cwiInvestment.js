let moment = require('moment')
let model = require('../model/cwiInvestment')
var orderModel = require('../model/Addorder')
let userModel = require('../model/users')
var fs = require('fs');
const path = require('path')
const notification = require('../util/saveNotification');
const { createPdfWithPuppeteer } = require('../util/pdfGeneration');
const { SendMessage, sendNotificationToAdmins } = require('../util/firebaseConfig')


module.exports.cwiInvestment = async (req, res) => {
    try {
        var day = moment().format('DD')
        var month = moment().format('MMMM')
        var year = moment().format('YYYY')
        var date = moment().format("YYYY-MM-DD")
        var moddate = moment().format("DD_MM_YYYY")
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let { id, amount, securityOption, clientInfo, nomineeDetails, duration, payment_method } = req.body

        if (!id) {
            return res.send({
                result: false,
                message: "UI ID is required"
            })
        }
        if (!amount) {
            return res.send({
                result: false,
                message: "Amount is required"
            })
        }
        if (!duration) {
            return res.send({
                result: false,
                message: "Duration is reqired"
            })
        }
        if (!payment_method) {
            return res.send({
                result: false,
                message: "Payment method is required"
            })
        }

        let futureCompanyData = await model.getFutureCompanyData(id)
        if (futureCompanyData.length === 0) {
            return res.send({
                result: false,
                message: "Company data not found."
            })
        }
        if (duration < 2) {
            return res.send({
                result: false,
                message: "Minimum duration is 2 years"
            })
        }
        let project_name = futureCompanyData[0].fi_industries
        let investment_amount = Number(amount)
        let futureDate = moment().add(parseFloat(duration), 'years');
        let investment_duration = futureDate.format("YYYY-MM-DD");
        let profit_model = 'fixed'
        let withdrawal_frequency = "quarterly"
        let client_name = clientInfo?.clientName
        let passportId = clientInfo?.proofId
        let residentialAddress = clientInfo?.residentialAddress
        let phone = clientInfo?.phone
        let email = clientInfo?.email
        let nomineeFullName = nomineeDetails?.nomineeFullName
        let relationship = nomineeDetails?.relationship
        let contactNumber = nomineeDetails?.contactNumber
        let nominee_residentialAddress = nomineeDetails?.residentialAddress
        let percentage = futureCompanyData[0]?.fi_expected_return
        let rangeParts = percentage.split('-');
        let lower = parseFloat(rangeParts[0]);
        let upper = parseFloat(rangeParts[1]);
        let avgPercentage = (lower + upper) / 2;
        let return_amount = (investment_amount * avgPercentage) / 100;
        let bankaccount = await model.getBankDetails(user_id)
        let nomineeData = null
        let createdNominee = null
        if (payment_method === "bank" && bankaccount.length === 0) {
            return res.send({
                result: false,
                message: "Bank account not found. Add bank first"
            })
        }
        const userdetails = await model.getUser(user_id)
        if (userdetails.length === 0) {
            return res.send({
                result: false,
                message: "User not found."
            })
        }
        if (payment_method === "wallet" && investment_amount > userdetails[0]?.u_wallet) {
            return res.send({
                result: false,
                message: "Insufficient amount in wallet"
            })
        }
        if (nomineeFullName) {
            nomineeData = await model.getnomineeDetails(user_id)
            if (nomineeData.length === 0) {
                createdNominee = await model.AddNominee(user_id, nomineeFullName, relationship, contactNumber, nominee_residentialAddress)
            }
        }
        if (!userdetails[0]?.u_kyc || userdetails[0].u_kyc !== "verified") {
            return res.send({
                result: false,
                message: "KYC needs to be verified before investing"
            })
        }
        let usernme = userdetails[0]?.u_name.toUpperCase().substring(0, 3)
        const agreementDir = '/mnt/ebs500/uploads/agreement'; // Central EBS-mounted directory
        const filename = `CON_${usernme}_${moddate}.pdf`;
        const fullPath = path.join(agreementDir, filename);  // Absolute path

        // Ensure the folder exists
        if (!fs.existsSync(agreementDir)) {
            fs.mkdirSync(agreementDir, { recursive: true });
        }

        //         let notarizationAgreement = `
        //         <!DOCTYPE html>
        // <html lang="en">

        // <head>
        //     <meta charset="UTF-8">
        //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
        //     <title>Funding Agreement</title>
        //     <style>
        //     .watermark-text {
        //             position: fixed;
        //             top: 50%;
        //             left: 50%;
        //             transform: translate(-50%, -50%);
        //             font-size: 6em;
        //             color: rgba(0, 0, 0, 0.05); /* Subtle watermark */
        //             text-transform: uppercase;
        //             white-space: nowrap;
        //             pointer-events: none; /* Ensure user interactions are not blocked */
        //             z-index: -1;
        //         }
        //         /* General Reset */
        //         body {
        //             margin: 0;
        //             font-family: Arial, sans-serif;
        //             line-height: 1.5;
        //             display: flex;
        //             flex-direction: column;
        //             min-height: 100vh;
        //         }

        //         /* Header Section */
        //         .header {
        //             margin-top: 100px;
        //             background: url('header-pattern.png') repeat-x, #0e0e0e;
        //             /* Replace with the background pattern file */
        //             padding: 20px 0;
        //             margin-bottom:300px;
        //             width: 40%;
        //             text-align: center;
        //         }

        //         .header img {
        //             width: 180px;
        //             /* Adjust logo size */
        //         }

        //         /* Title Section */
        //         .title-section {
        //             text-align: center;
        //             margin: 100px 0;
        //             position: relative;

        //             display: flex;
        //             justify-content: center;
        //             align-items: center;
        //             flex: 1;
        //             /* Ensures the title section occupies remaining space */
        //         }

        //         .title-section h1 {
        //             font-size: 36px;
        //             font-weight: bold;
        //             margin: 0;
        //             text-align: center;
        //         }

        //         .title-section h2 {
        //             font-size: 28px;
        //             margin: 10px 0 0;
        //             font-weight: normal;
        //             padding-bottom:280px;
        //         }

        //         .title-section::before {
        //             font-size: 200px;
        //             color: rgba(0, 0, 0, 0.05);
        //             position: absolute;
        //             top: 50%;
        //             left: 50%;
        //             transform: translate(-50%, -50%);
        //             z-index: -1;
        //         }

        //         .flexstyle {

        //             display: flex;
        //             justify-content: center;
        //             align-items: center;

        //         }

        //         /* Footer Section */
        //         .footer {
        //             background-color: #fff;
        //             border-top: 2px solid #ddd;
        //             display: flex;
        //             justify-content: space-between;
        //             align-items: center;
        //             padding: 20px;
        //             font-size: 14px;
        //         }

        //         .footer div {
        //             margin: 0 20px;
        //             text-align: center;
        //         }

        //         .footer div img {
        //             vertical-align: middle;
        //             margin-right: 8px;
        //         }

        //         .footer div span {
        //             display: block;
        //             font-size: 14px;
        //             color: #333;
        //         }

        //         .footer div a {
        //             color: #333;
        //             text-decoration: none;
        //         }

        //         /* Footer Bottom Padding */
        //         .footer::after {
        //             content: '';
        //             display: block;
        //             height: 20px;
        //             /* Adds space between footer and page bottom */
        //         }

        //         .phone-icon {
        //             width: 10px;
        //             height: 10px;
        //         }

        //         .contract-container {
        //         break-after:page;
        //             max-width: 800px;
        //             margin: 0 auto;
        //             padding: 20px;
        //             background: #fff;
        //         }

        //         .contract-containers {
        //             max-width: 800px;
        //             margin: 0 auto;
        //             padding: 20px;
        //             background: #fff;
        //             flex: 1;
        //             break-after:page
        //         }

        //         .section-title {
        //             text-align: center;
        //             font-weight: bold;
        //             margin-bottom: 20px;
        //             font-size: 18px;
        //         }

        //         .paragraph {
        //             margin-bottom: 20px;
        //             text-align: justify;
        //         }

        //         .party-section {
        //             margin-bottom: 30px;
        //         }

        //         .party-title {
        //             font-weight: bold;
        //             text-decoration: underline;
        //         }

        //         .party-details {
        //             margin-top: 10px;
        //             line-height: 1.8;
        //         }

        //         .arabic-text {
        //             direction: ltr;
        //             text-align: right;
        //             font-size: 12px;
        //         }

        //         .recital-title {
        //             font-weight: bold;
        //             margin-top: 30px;
        //         }

        //         .recitals {
        //             margin-top: 20px;
        //         }

        //         .recitals p {
        //             margin-bottom: 15px;
        //         }

        //         .form-fields {
        //             display: inline-block;
        //             border-bottom: 1px solid #000;
        //             width: 200px;
        //             margin-left: 10px;
        //         }

        //         .section {
        //             margin-bottom: 20px;
        //         }

        //         .section h2 {
        //             margin-bottom: 10px;
        //             font-size: 18px;
        //             text-transform: uppercase;
        //         }

        //         .english-text {
        //             text-align: left;
        //         }

        //         .arabic-text {
        //             text-align: left;
        //             /* Arabic text left-aligned */
        //             direction: rtl;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         ul {
        //             margin: 10px 0;
        //             padding-left: 20px;
        //         }

        //         .content {
        //             background: #fff;
        //             padding: 20px;
        //             border-radius: 8px;
        //             max-width: 800px;
        //             margin: 0 auto;
        //         }

        //         ul {
        //             list-style-type: none;
        //             padding: 0;
        //         }

        //         ul li {
        //             margin-bottom: 10px;
        //         }

        //         strong {
        //             font-weight: bold;
        //         }

        //         p {
        //             margin-bottom: 15px;
        //         }

        //         p.arabic {
        //             direction: rtl;
        //             text-align: right;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         .content {
        //             background: #fff;
        //             padding: 20px;
        //             border-radius: 5px;
        //             max-width: 800px;
        //             margin: 0 auto;
        //             text-align: left;
        //         }

        //         ul {
        //             margin: 10px 0;
        //             padding-left: 20px;
        //             text-align: right;
        //             direction: rtl;
        //         }

        //         li {
        //             margin-bottom: 8px;
        //         }

        //         .arabic {
        //             text-align: left;
        //             /* Arabic text left-aligned */
        //             direction: rtl;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         .contents {
        //             background: #fff;
        //             padding: 20px;
        //             // border: 1px solid #ddd;
        //             border-radius: 5px;
        //             max-width: 800px;
        //             margin: 0 auto;
        //             text-align: left;
        //             /* Aligns all text to the left */
        //             direction: ltr;
        //         }

        //         .arabic {
        //             direction: rtl;
        //             text-align: left;
        //             /* Align Arabic text to the left */
        //             font-size: 14px;
        //             color: #333;
        //         }

        //         h3 {
        //             font-size: 18px;
        //             font-weight: bold;
        //             color: #444;
        //             margin-top: 20px;
        //         }

        //         h4 {
        //             font-size: 16px;
        //             font-weight: bold;
        //             color: #555;
        //             margin-top: 15px;
        //         }

        //         p {
        //             margin: 10px 0;
        //             font-size: 14px;
        //             color: #333;
        //         }

        //         ul {
        //             margin: 10px 0 10px 20px;
        //             padding-left: 20px;
        //         }

        //         li {
        //             margin-bottom: 8px;
        //             font-size: 14px;
        //             color: #333;
        //         }

        //         .content {
        //             background: #fff;
        //             padding: 20px;
        //             // border: 1px solid #ddd;
        //             border-radius: 5px;
        //             max-width: 800px;
        //             margin: 0 auto;
        //             text-align: left;
        //             /* Aligns all text to the left */
        //             direction: ltr;
        //         }

        //         .arabic {
        //             direction: rtl;
        //             text-align: right;
        //             /* Align Arabic text to the left */
        //             font-size: 14px;
        //             color: #333;
        //         }

        //         h3,
        //         h4 {
        //             font-size: 18px;
        //             font-weight: bold;
        //             color: #444;
        //             margin-top: 20px;
        //         }

        //         p {
        //             margin: 10px 0;
        //             font-size: 14px;
        //             color: #333;
        //         }

        //         .section {
        //             margin-bottom: 20px;
        //         }

        //         .arabic {
        //             direction: rtl;
        //             text-align: right;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         .english {
        //             direction: ltr;
        //             text-align: left;
        //         }

        //         .section {
        //             margin-bottom: 20px;
        //         }

        //         .arabic {
        //             direction: rtl;
        //             text-align: right;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         .english {
        //             direction: ltr;
        //             text-align: left;
        //         }

        //         table {
        //             width: 100%;
        //             border-collapse: collapse;
        //             margin: 20px 0;
        //         }

        //         table,
        //         th,
        //         td {
        //             border: 1px solid black;
        //         }

        //         th,
        //         td {
        //             padding: 10px;
        //             text-align: center;
        //         }

        //         .arabic-header {
        //             direction: rtl;
        //             text-align: center;
        //         }

        //         .headss {
        //             font-size: 13px;
        //         }

        //         .container {
        //             width: 80%;
        //             margin: 0 auto;
        //         }
        //             .containerss{
        //             break-before:page;}

        //         h1 {
        //             text-align: center;
        //             margin-bottom: 10px;
        //         }

        //         h1.arabic {
        //             font-family: 'Arial', sans-serif;
        //             direction: rtl;
        //             text-align: center;
        //         }

        //         .section {
        //             margin-bottom: 20px;
        //         }

        //         .label {
        //             font-weight: bold;
        //             display: block;
        //             margin-top: 10px;
        //         }

        //         .input-field {
        //             border: 1px solid #000;
        //             width: 100%;
        //             padding: 5px;
        //             margin-top: 5px;
        //         }

        //         .arabic {
        //             direction: rtl;
        //             text-align: right;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         .container {
        //             width: 80%;
        //             margin: 0 auto;
        //         }

        //         h2 {
        //             margin-bottom: 10px;
        //         }

        //         h2.arabic {
        //             text-align: right;
        //             direction: rtl;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         p {
        //             margin-bottom: 10px;
        //         }

        //         .section {
        //             margin-bottom: 20px;
        //         }

        //         .english {
        //             text-align: left;
        //         }

        //         .arabic {
        //             direction: rtl;
        //             text-align: right;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         .container {
        //             width: 100%;
        //             margin: 0 auto;
        //         }

        //         h2 {
        //             margin-bottom: 10px;
        //         }

        //         h2.arabic {
        //             text-align: right;
        //             direction: rtl;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         p {
        //             margin-bottom: 15px;
        //         }

        //         .section {
        //             margin-bottom: 20px;
        //         }

        //         .english {
        //             text-align: left;
        //         }

        //         .arabic {
        //             direction: rtl;
        //             text-align: right;
        //             font-family: 'Arial', sans-serif;
        //         }

        //         .signature-section {
        //             display: flex;
        //             justify-content: space-between;
        //             margin-top: 40px;
        //         }

        //         .signature-block {
        //             width: 45%;
        //             text-align: center;
        //         }

        //         .signature-block .arabic {
        //             direction: rtl;
        //         }

        //         .date-line {
        //             margin-top: 20px;
        //         }
        //         .signature{
        //         height:20%;
        //         width:20%;
        //         }
        //     </style>
        // </head>

        // <body>
        //      <div class="contract-containers">
        //       <div class="watermark-text">CORAL WEALTH</div>
        //         <!-- Header -->
        //         <div class="header">
        //             <img src="https://lunarsenterprises.com:6017/uploads/agreement_needs/coraluae.webp" alt="Coral Wealth Investment Logo">
        //             <!-- Replace with your logo file -->
        //         </div>

        //         <!-- Title Section -->
        //         <div class="title-section">
        //             <div>
        //                 <h1>FUNDING AGREEMENT</h1>
        //                 <div>
        //                     <h2>اتفاقية التمويل</h2>
        //                 </div>
        //             </div>
        //         </div>
        //         <!-- Footer -->
        //     <div class="footer">
        //         <div class="flexstyle">
        //             <img class='phone-icon' src="https://lunarsenterprises.com:6017/uploads/agreement_needs/phone.png" alt="Phone">
        //             <!-- Replace with phone icon -->
        //             <span>+971 4 287 7411</span>
        //         </div>
        //         <div>
        //             <img class='phone-icon' src="https://lunarsenterprises.com:6017/uploads/agreement_needs/internet.png" alt="Email">
        //             <!-- Replace with email icon -->
        //             <a href="mailto:info@coraluce.com">info@coraluce.com</a>
        //         </div>
        //         <div class="flexstyle">
        //             <img class='phone-icon' src="https://lunarsenterprises.com:6017/uploads/agreement_needs/location.png" alt="Location">
        //             <!-- Replace with location icon -->
        //             <span>310, 3rd Floor, SIT Towers, Dubai Silicon Oasis, Dubai</span>
        //         </div>
        //     </div>
        //     </div>


        //     <div class="contract-container">
        //         <!-- Title Section -->
        //         <p class="paragraph">
        //             This Project Funding Contract (hereinafter referred to as the "Agreement") is made and entered into as of
        //             the ${day} day of ${month}, ${year}, by and between:
        //         </p>
        //         <p class="arabic-text">
        //             تم إبرام عقد تمويل المشروع هذا (المشار إليه فيما يلي باسم "الاتفاقية") ويدخل حيز التنفيذ اعتباراً من ${day} يوم
        //             ${month} ، ${year} بين:

        //         </p>

        //         <!-- First Party Section -->
        //         <div class="party-section">
        //             <p class="party-title">First Party:</p>
        //             <p class="party-details">
        //                 CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C, a company registered in the
        //                 Emirate of Dubai, United Arab Emirates, under license number 1250854, with its registered office at
        //                 Silicon Oasis, Dubai, UAE (hereinafter referred to as the "First Party").
        //             </p>
        //             <p class="arabic-text">
        //                 الطرف الأول:
        //                 شركة كورال ويلث للاستثمار في مشاريع الرعاية الصحية والتطوير ذ.م.م، شركة مسجلة في إمارة دبي، الإمارات
        //                 العربية المتحدة،
        //                 بموجب ترخيص رقم 1250854، ويقع مكتبها المسجل في واحة السيلكون، دبي، الإمارات العربية المتحدة (يشـار إليها
        //                 فيما يلي باسم
        //                 "الطرف الأول").

        //             </p>
        //         </div>

        //         <!-- Second Party Section -->
        //         <div class="party-section">
        //             <p class="party-title">Second Party:</p>
        //             <p class="party-details">
        //                 ${clientInfo.clientName}, holder of Emirates ID No. <span class="form-fields">${clientInfo.passportId}</span>, residing at <span
        //                     class="form-fields">${clientInfo.residentialAddress}</span>,
        //                 phone number <span class="form-fields">${clientInfo.phone}</span>, email <span class="form-fields">${clientInfo.email}</span> (hereinafter
        //                 referred to as the "Second Party").
        //             </p>
        //             <p class="arabic-text">
        //                 الطرف الثاني:<br>
        //                 [اسم العميل]، حامل بطاقة الهوية الإماراتية رقم <span class="form-fields">${clientInfo.clientName}</span>، ويقيم في <span
        //                     class="form-fields">${clientInfo.passportId}</span>،
        //                 رقم الهاتف <span class="form-fields">${clientInfo.residentialAddress}</span>، البريد الإلكتروني <span class="form-fields">${clientInfo.phone}</span> (يشار
        //                 إليه فيما يلي باسم "الطرف الثاني").
        //             </p>
        //         </div>

        //         <!-- Recitals Section -->
        //         <div class="recitals">
        //             <p class="recital-title">RECITALS</p>
        //             <p class="paragraph">
        //                 WHEREAS, the First Party is engaged in the business of investing in growing industries, including
        //                 commercial sectors, industrial sectors, healthcare sectors, educational sectors, technological sectors,
        //                 and retail sectors;
        //             </p>
        //             <p class="paragraph">
        //                 WHEREAS, the Second Party wishes to invest a sum of AED <span class="form-fields">${investment_amount}</span> with the First
        //                 Party for the purpose of earning profits from the First Party's investments in these sectors;
        //             </p>
        //             <p class="paragraph">
        //                 NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties
        //                 hereto agree as follows:
        //             </p>
        //             <p class="arabic-text">
        //                 حيث أن الطرف الأول يعمل في مجال الاستثمار في الصناعات المتنامية، بما في ذلك القطاعات التجارية، والقطاعات
        //                 الصناعية،
        //                 وقطاعات الرعاية الصحية، والقطاعات التعليمية، والقطاعات التكنولوجية، وقطاعات التجزئة؛
        //             </p>
        //             <p class="arabic-text">
        //                 وحيث يرغب الطرف الثاني في استثمار مبلغ <span class="form-fields">${investment_amount}</span> درهم إماراتي لدى الطرف الأول
        //                 بهدف تحقيق أرباح من استثمارات الطرف الأول في هذه القطاعات؛
        //             </p>
        //             <p class="arabic-text">
        //                 الآن، وبناءً على عوض الحقوق المتبادلة والعهود الواردة في هذه الاتفاقية، يتفق الطرفان على ما يلي:
        //             </p>
        //         </div>
        //     </div>

        // <div class="contract-container">
        //     <div class="section">
        //         <h2>1. Purpose of the Agreement</h2>
        //         <p class="english-text">
        //             The purpose of this Agreement is to establish the terms and conditions under which the Second Party will
        //             provide funding to the First Party for investment in growing industries, with the objective of earning a
        //             profit that will be shared between the parties or a fixed return based on the capital amount as agreed by
        //             the parties.
        //         </p>
        //         <p class="arabic-text">
        //             الغرض من هذه الاتفاقية هو تحديد الشروط والأحكام التي بموجبها سيقوم الطرف الثاني بتقديم التمويل للطرف الأول
        //             للاستثمار في الصناعات الناشئة، وذلك بهدف تحقيق ربح يتم تقسيمه بين الطرفين أو عائد ثابت على أساس رأس المال
        //             المتفق عليه بين الطرفين.
        //         </p>
        //     </div>

        //     <div class="section">
        //         <h2>2. Funding Amount</h2>
        //         <p class="english-text">
        //             The Second Party agrees to provide the First Party with a sum of AED ${investment_amount} (hereinafter referred to as
        //             the "Funding Amount"), which will be used by the First Party to invest in the following sectors:
        //         </p>
        //         <ul class="english-text">
        //             <li>Commercial Sectors</li>
        //             <li>Industrial Sectors</li>
        //             <li>Healthcare Sectors</li>
        //             <li>Educational Sectors</li>
        //             <li>Technological Sectors</li>
        //             <li>Retail Sectors</li>
        //             <li>Other Growing Industries</li>
        //         </ul>
        //         <p class="arabic-text">
        //             يوافق الطرف الثاني على تزويد الطرف الأول بمبلغ قدره ${investment_amount} درهم إماراتي (يشار إليه فيما يلي بـ "مبلغ
        //             التمويل")، والذي سيستخدمه الطرف الأول للاستثمار في القطاعات التالية:
        //         </p>
        //         <ul class="arabic-text">
        //             <li>القطاعات التجارية</li>
        //             <li>القطاعات الصناعية</li>
        //             <li>قطاعات الرعاية الصحية</li>
        //             <li>القطاعات التعليمية</li>
        //             <li>القطاعات التكنولوجية</li>
        //             <li>قطاعات البيع بالتجزئة</li>
        //             <li>الصناعات الناشئة الأخرى</li>
        //         </ul>
        //     </div>
        // </div>
        //     <div class="section">
        //         <h2>3. Fund Transfer and Liability Clause</h2>
        //         <p class="english-text">
        //             The Second Party agrees that all funds related to the investment under this Agreement shall be transferred
        //             exclusively to the following bank account belonging to the First Party:
        //         </p>
        //         <p class="arabic-text">
        //             يوافق الطرف الثاني على أن جميع الأموال المتعلقة بالاستثمار بموجب هذه الاتفاقية سيتم تحويلها حصرياً إلى
        //             الحساب البنكي التالي الخاص بالطرف الأول:
        //         </p>
        //     </div>
        //     <div class="content">
        //         <ul class = "contents">
        //             <li><strong>Account Name:</strong> CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C
        //             </li>
        //             <li><strong>Account Currency:</strong> AED</li>
        //             <li><strong>IBAN:</strong> AE330860000009467791855</li>
        //             <li><strong>BIC/SWIFT:</strong> WIOBAEADXXX</li>
        //             <li><strong>Account Number:</strong> 9467791855</li>
        //         </ul>

        //         <p class="arabic">
        //             اسم الحساب: شركة كورال ويلث للاستثمار في المشاريع الصحية والتطوير ذ.م.م<br>
        //             عملة الحساب: درهم إماراتي<br>
        //             رقم الحساب الدولي (IBAN): AE330860000009467791855<br>
        //             رمز BIC/سويفت: WIOBAEADXXX<br>
        //             رقم الحساب: 9467791855
        //         </p>


        //         <p>
        //             The Second Party acknowledges and agrees that any transfer of funds to any individual account or account not
        //             belonging to the First Party shall be considered a violation of this Agreement. In such cases, the First
        //             Party shall bear no liability for any loss, damage, or claims arising from such unauthorized transfers. The
        //             First Party shall not be responsible for any investment or profit on funds transferred to any account other
        //             than the official bank account listed above.
        //         </p>

        //         <p class="arabic">
        //             يقر الطرف الثاني ويوافق على أن أي تحويل للأموال إلى أي حساب فردي أو حساب لا يتبع إلى الطرف الأول يعتبر
        //             انتهاكًا لهذه الاتفاقية. في هذه الحالات، لا يتحمل الطرف الأول أي مسؤولية عن خسارة أو ضرر أو مطالبات تنشأ عن
        //             عمليات النقل غير المصرح بها. لن يكون الطرف الأول مسؤولاً عن أي استثمار أو ربح عن الأموال المحولة إلى أي حساب
        //             غير الحساب البنكي الرسمي المذكور أعلاه.
        //         </p>

        //         <p>
        //             The First Party further agrees to pay the Second Party all profit distributions as per the terms of this
        //             Agreement to the following bank account designated by the Second Party:
        //         </p>

        //         <ul class = "contents">
        //             <li><strong>Second Party's Account Name:</strong> ${clientInfo.clientName}</li>
        //             <li><strong>Bank Name:</strong> ${bankaccount[0]?.b_name}</li>
        //             <li><strong>IBAN:</strong> ${bankaccount[0]?.b_ifsc_code}</li>
        //             <li><strong>BIC/SWIFT:</strong> ${bankaccount[0]?.b_swift_code}</li>
        //             <li><strong>Account Number:</strong> ${bankaccount[0]?.b_account_no}</li>
        //         </ul>

        //         <p>
        //             Any changes to the Second Party's account details must be communicated in writing and acknowledged by the
        //             First Party before any subsequent profit payments are made.
        //         </p>
        //     </div>
        //     <div class="content">
        //         <p class="arabic">
        //             يوافق الطرف الأول أيضًا على دفع جميع توزيعات الأرباح للطرف الثاني وفقًا لشروط هذه الاتفاقية إلى الحساب
        //             البنكي الخاص بالطرف الثاني:
        //         </p>
        //         <ul>
        //             <li>اسم حساب الطرف الثاني: ${clientInfo.clientName}</li>
        //             <li>اسم البنك: ${bankaccount[0]?.b_name}</li>
        //             <li>رقم الحساب الشخصي: ${bankaccount[0]?.b_ifsc_code}</li>
        //             <li>رقم السويفت:${bankaccount[0]?.b_swift_code}</li>
        //             <li>رقم الحساب: ${bankaccount[0]?.b_account_no}</li>
        //         </ul>
        //         <p>
        //             يجب إرسال أي تغييرات في تفاصيل حساب الطرف الثاني كتابيًا والإقرار بها من قبل الطرف الأول قبل إجراء أي دفعات
        //             أرباح لاحقة.
        //         </p>

        //         <h3>3. PROFIT SHARING MODELS</h3>
        //         <p>
        //             The parties agree that the Second Party may choose between two profit-sharing models:
        //         </p>

        //         <h4>3.1 Variable Profit Sharing Model</h4>
        //         <p class="arabic">
        //             بموجب نموذج مشاركة الأرباح المتغيرة، يتم توزيع أي ربح ناتج عن استثمار مبلغ التمويل على النحو التالي:
        //         </p>
        //         <ul>
        //             <li>يُدفع 80% من الربح للطرف الثاني.</li>
        //             <li>يحتفظ الطرف الأول بنسبة 20% من الربح كم رسوم إدارية.</li>
        //         </ul>
        //         <p>
        //             Under the Variable Profit Sharing Model, any profit generated from the investment of the Funding Amount
        //             shall be distributed as follows:
        //         </p>
        //         <ul class = "contents">
        //             <li>80% of the profit shall be paid to the Second Party.</li>
        //             <li>20% of the profit shall be retained by the First Party as its management fee.</li>
        //         </ul>

        //         <h4>3.2 Fixed Return Model</h4>
        //         <p class="arabic">
        //             إذا اختار الطرف الثاني نموذج العائد الثابت، فيسلم على نسبة ثابتة (%) من مبلغ التمويل على وتيرة سحب الأرباح
        //             بغض النظر عن الأرباح الفعلية المحققة.
        //         </p>
        //         <p>
        //             If the Second Party opts for a Fixed Return Model, the Second Party shall receive a fixed percentage (%) of
        //             the Funding Amount on the selected profit withdrawal frequency, regardless of the actual profits generated.
        //         </p>

        //         <h4>3.2 Selection and Confirmation of Profit-Sharing Models</h4>
        //         <p class="arabic">
        //             اختيار وتأكيد نموذج تقاسم الأرباح.
        //         </p>
        //     </div>
        //     <div class="content">
        //         <p>
        //             The selection and confirmation of the profit-sharing model chosen by the Second Party, whether the
        //             <strong>Variable Profit Sharing Model</strong> or the <strong>Fixed Return Model</strong>, shall be clearly
        //             indicated and documented in <strong>Annexure A</strong> attached hereto and made an integral part of this
        //             Agreement.
        //         </p>
        //         <p>
        //             Both parties agree that the selection of the profit-sharing model shall be final and binding upon signing
        //             this Agreement, and any modification to the selected model must be mutually agreed upon in writing by both
        //             parties.
        //         </p>
        //         <p>
        //             The parties further acknowledge and agree that <strong>Annexure A</strong>, signed and dated by both parties
        //             at the time of executing this Agreement, constitutes the official record of the Second Party’s choice
        //             regarding the profit-sharing model and its corresponding terms, as outlined in this Agreement.
        //         </p>
        //         <p class="arabic">
        //             إن اختيار وتأكيد نموذج تقاسم الأرباح الذي اختار الطرف الثاني، سواء كان نموذج تقاسم الأرباح المتغيرة أو نموذج
        //             العائد الثابت، يجب الإشارة إليه وتوثيقه في المرفق أ المرفق بهذه الاتفاقية، وجعله جزءًا لا يتجزأ من هذه
        //             الاتفاقية.
        //         </p>
        //         <p class="arabic">
        //             يتفق الطرفان على أن اختيار نموذج تقاسم الأرباح سيكون نهائيًا وملزمًا عند توقيع هذه الاتفاقية، وأي تعديل على
        //             النموذج المختار يجب أن يتم الاتفاق عليه كتابيًا بين الطرفين.
        //         </p>
        //         <p class="arabic">
        //             يقر الطرفان ويؤكدان أن المرفق أ، الموقع والمؤرخ من قبل الطرفين في وقت تنفيذ هذه الاتفاقية، يشكل السجل الرسمي
        //             لاختيار الطرف الثاني فيما يتعلق بنموذج تقاسم الأرباح والشروط المقابلة له، على النحو المبين في هذه الاتفاقية.
        //         </p>

        //         <h3>4. PAYMENT TERMS</h3>

        //         <h4>4.1 Payout Frequency</h4>
        //         <p>
        //             The Second Party may choose the frequency of their payouts, which can be <strong>monthly, quarterly,
        //                 semi-annual, or annual</strong>. The payout date shall be either the 15th or the last day of the month,
        //             as selected by the parties.
        //         </p>
        //         <p class="arabic">
        //             يجوز للطرف الثاني اختيار وتيرة مدفوعاته، والتي يمكن أن تكون شهرية أو ربع سنوية أو نصف سنوية أو سنوية. يجب أن
        //             يكون تاريخ الدفع إما الخامس عشر أو اليوم الأخير من الشهر، وفقًا لما يحدده الطرفان.
        //         </p>

        //         <h4>4.2 Payment Mode</h4>
        //         <p>
        //             Profit payments may be made by the First Party through any of the following methods:
        //         </p>
        //         <ul class = "contents">
        //             <li>Cash</li>
        //             <li>Bank transfer</li>
        //         </ul>
        //         <p class="arabic">
        //             يجوز للطرف الأول دفع الأرباح من خلال أي من الطرق التالية:
        //         </p>
        //         <ul class="arabic">
        //             <li>أموال نقدية</li>
        //             <li>تحويل مصرفي</li>
        //         </ul>
        //         <p>
        //             In case the payout date falls on a weekend, bank holiday, or national holiday, the payment shall be made on
        //             the next working day.
        //         </p>
        //         <p class="arabic">
        //             في حالة وقوع تاريخ الدفع في عطلة نهاية الأسبوع أو عطلة البنوك أو عطلة وطنية، يجب أن يتم الدفع في يوم العمل
        //             التالي.
        //         </p>
        //     </div>
        //     <div class="content">
        //         <h4>4.3 Others</h4>
        //         <p>
        //             The First Party shall not be held liable for any delays in payment caused by technical errors, server
        //             issues, or bank delays in reflecting the payment in the Second Party’s bank account.
        //         </p>
        //         <p class="arabic">
        //             لن يكون الطرف الأول مسؤولاً عن أي تأخير في الدفع ناتج عن أخطاء فنية، أو مشكلات في الخادم، أو تأخيرات مصرفية
        //             في عكس الدفع في الحساب البنكي للطرف الثاني.
        //         </p>
        //         <p>
        //             Payments will be processed through an automated system from the First Party’s bank account to the Second
        //             Party’s designated bank account.
        //         </p>
        //         <p class="arabic">
        //             سيتم معالجة المدفوعات آلياً من الحساب البنكي للطرف الأول إلى الحساب البنكي المخصص للطرف الثاني.
        //         </p>

        //         <h3>5. SECURITY DOCUMENTS</h3>
        //         <p>
        //             The Second Party may choose to receive <strong>shares</strong> or a <strong>cheque</strong> equivalent to
        //             the value of their capital investment as security for the Funding Amount. The Second Party can also opt for
        //             a notarization of the agreement.
        //         </p>
        //         <p class="arabic">
        //             يجوز للطرف الثاني أن يختار الحصول على أسهم أو شيك يعادل قيمة استثمار رأس المال كضمان لمبلغ التمويل. يمكن
        //             للطرف الثاني أيضًا اختيار توثيق الاتفاقية.
        //         </p>

        //         <h4>5.1 Share Transfer Costs</h4>
        //         <p>
        //             If the Second Party opts for shares, the party initiating the share transfer shall bear the associated
        //             costs.
        //         </p>
        //         <p class="arabic">
        //             إذا اختار الطرف الثاني الأسهم، فإن الطرف الذي يبدأ نقل الأسهم يتحمل التكاليف المرتبطة بها.
        //         </p>

        //         <h4>5.2 Notarization Costs</h4>
        //         <p>
        //             In the event the Second Party opts for notarization of this Agreement, the Second Party shall bear the legal
        //             fees for such notarization.
        //         </p>
        //         <p class="arabic">
        //             إذا اختار الطرف الثاني توثيق هذه الاتفاقية، فيتحمل الطرف الثاني الرسوم القانونية لهذا التوثيق.
        //         </p>

        //         <h3>6. RETURN OF FUNDING AMOUNT</h3>

        //         <h4>6.1 End of Contract</h4>
        //         <p>
        //             At the end of the contract term, the First Party shall repay the entire Funding Amount to the Second Party,
        //             with a notice period of <strong>three (3) months</strong>.
        //         </p>
        //         <p class="arabic">
        //             في نهاية مدة العقد، يقوم الطرف الأول بسداد مبلغ التمويل بالكامل إلى الطرف الثاني مع فترة إشعار مدتها ثلاثة
        //             (3) أشهر.
        //         </p>
        //     </div>
        //     <div class="section">
        //         <h3 class="english">6.2 Termination of Contract</h3>
        //         <p class="english">
        //             Either party may terminate this Agreement by providing the other party with a written notice of
        //             termination at least three (3) months prior to the desired termination date, or by mutual agreement.
        //         </p>
        //         <h3 class="arabic">6.2 إنهاء العقد</h3>
        //         <p class="arabic">
        //             يجوز لأي من الطرفين إنهاء هذه الاتفاقية عن طريق تقديم إشعار كتابي للطرف الآخر بالإلغاء قبل ثلاثة (3) أشهر
        //             على الأقل من تاريخ
        //             الإنهاء المطلوب، أو عن طريق الاتفاق المشترك.
        //         </p>
        //     </div>

        //     <div class="section">
        //         <h3 class="english">6.3 Cost of Share Transfer upon Termination</h3>
        //         <p class="english">
        //             In the event of termination, the party initiating the share transfer shall bear all costs associated with
        //             the transfer.
        //         </p>
        //         <h3 class="arabic">6.3 تكلفة نقل الأسهم عند الإنهاء</h3>
        //         <p class="arabic">
        //             في حالة الإنهاء، يتحمل الطرف الذي يبدأ نقل الأسهم جميع التكاليف المرتبطة بالتحويل.
        //         </p>
        //     </div>

        //     <div class="section">
        //         <h3 class="english">7. ARBITRATION AND DISPUTE RESOLUTION</h3>
        //         <p class="english">
        //             Any dispute arising out of or in connection with the interpretation, implementation, validity, or
        //             termination of this Agreement shall be finally settled by arbitration in accordance with the
        //             regulations of the Dubai International Arbitration Center (DIAC) and in compliance with
        //             Federal Law No. (6) of 2018 regarding arbitration.
        //         </p>
        //         <h3 class="arabic">7. التحكيم وحل النزاعات</h3>
        //         <p class="arabic">
        //             أي نزاع ناشئ عن أو فيما يتعلق بتفسير هذه الاتفاقية أو تنفيذها أو صحتها أو إنهائها يتم تسويته نهائيًا عن طريق
        //             التحكيم وفقًا لأنظمة
        //             مركز التحكيم الدولي (DIAC) ووفقًا للقانون الاتحادي رقم (6) لسنة 2018 في شأن التحكيم.
        //         </p>
        //     </div>

        //     <div class="section">
        //         <h3 class="english">8. MISCELLANEOUS</h3>
        //         <h4 class="english">8.1 Entire Agreement</h4>
        //         <p class="english">
        //             This Agreement constitutes the entire agreement between the parties and supersedes all prior
        //             agreements, whether oral or written.
        //         </p>
        //         <h4 class="arabic">8.1 الاتفاقية بكاملها</h4>
        //         <p class="arabic">
        //             تشكل هذه الاتفاقية الاتفاقية الكاملة بين الطرفين وتحل محل جميع الاتفاقيات السابقة، سواء كانت شفهية أو
        //             مكتوبة.
        //         </p>
        //         <h4 class="english">8.2 Amendments</h4>
        //         <p class="english">
        //             This Agreement may be amended or modified only by written agreement signed by both parties.
        //         </p>
        //         <h4 class="arabic">8.2 التعديلات</h4>
        //         <p class="arabic">
        //             لا يجوز تعديل هذه الاتفاقية أو تغييرها إلا بموجب اتفاقية مكتوبة موقعة من الطرفين.
        //         </p>
        //         <h4 class="english">8.3 Governing Law</h4>
        //         <p class="english">
        //             This Agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates.
        //         </p>
        //     </div>

        //     <div class="section">
        //         <h3 class="english">8.3 Governing Law</h3>
        //         <p class="english">
        //             This Agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates.
        //         </p>
        //         <h3 class="arabic">8.3 القانون الحاكم</h3>
        //         <p class="arabic">
        //             تخضع هذه الاتفاقية وتفسر وفقًا لقوانين دولة الإمارات العربية المتحدة.
        //         </p>
        //     </div>

        //     <div class="section">
        //         <h3 class="english">8.4 Counterparts</h3>
        //         <p class="english">
        //             This Agreement has been executed in two (2) counterparts, one for each party, each of which shall be deemed
        //             an original.
        //         </p>
        //         <h3 class="arabic">8.4 نظائرهم</h3>
        //         <p class="arabic">
        //             تم تحرير هذه الاتفاقية في نسختين (2)، واحدة لكل طرف، وتعتبر كل منهما أصليًا.
        //         </p>
        //     </div>

        //     <div class="section">
        //         <p class="english">
        //             IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the day and year first above
        //             written.
        //         </p>
        //         <p class="arabic">
        //             وإثباتًا لما تقدم، قام الطرفان بتنفيذ هذه الاتفاقية اعتبارًا من اليوم والسنة المذكورين أعلاه.
        //         </p>
        //     </div>

        //     <div class="section">
        //         <h3 class="english">ANNEXURE A</h3>
        //         <h3 class="arabic">الملحق أ</h3>
        //         <table>
        //             <thead>
        //                 <tr>
        //                     <th class="arabic-header">
        //                         <div class="headss">
        //                             Capital Amount
        //                         </div>

        //                         مبل
        //                         غ رأس المال
        //                     </th>
        //                     <th class="arabic-header">
        //                         <div class="headss">
        //                             Profit Sharing Model
        //                         </div>نموذج تقاسم الأرباح
        //                     </th>
        //                     <th class="arabic-header">
        //                         <div class="headss">
        //                             Return % Per Annum
        //                         </div class="headss">العائد/ سنويًا
        //                     </th>
        //                     <th class="arabic-header">
        //                         <div class="headss">
        //                             Withdrawal Frequency
        //                         </div>تردد السحب
        //                     </th>
        //                     <th class="arabic-header">
        //                         <div class="headss">
        //                             Contract Duration
        //                         </div>مدة العقد
        //                     </th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 <tr>
        //                     <td>${investment_amount}</td>
        //                     <td>${profit_model}</td>
        //                     <td>${percentage}</td>
        //                     <td>${withdrawal_frequency}</td>
        //                     <td>${investment_duration}</td>
        //                 </tr>
        //             </tbody>
        //         </table>
        //     </div>

        //     <div class="section">
        //         <p class="english">
        //             First Party: CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C
        //         </p>
        //         <p class="arabic">
        //             الطرف الأول: شركة كورال ويلث للاستثمار في مشاريع الرعاية الصحية والتطوير ذ.م.م
        //         </p>

        //         <p class="english">Authorized Signatory</p>
        //         <p class="arabic">المفوض بالتوقيع</p>
        //     </div>

        //     <div class="section">
        //         <p class="english">Second Party: ${clientInfo.clientName}</p>
        //         <p class="arabic">الطرف الثاني: [اسم العميل]</p>
        //     </div>

        //     <div class="containerss">
        //         <h1>Nominee Declaration</h1>
        //         <h1 class="arabic">إعلان المرشح</h1>

        //         <div class="section">
        //             <p>
        //                 I, [Second Party's Full Name], holder of Emirates ID No. ${clientInfo.passportId}, residing at ${clientInfo.residentialAddress}
        //                 (hereinafter referred to as the "Second Party"), do hereby declare and appoint the following individual
        //                 as
        //                 my Nominee in relation to my investment under the Project Funding Agreement dated ${day} day of ${month},
        //                 ${year}, between myself and CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C
        //                 (the "First Party").
        //             </p>
        //         </div>

        //         <div class="section arabic">
        //             <p>
        //                 أنا (الاسم الكامل للطرف الثاني)، حامل بطاقة الهوية الإماراتية رقم ${clientInfo.passportId} ، وأقيم في
        //                 ${clientInfo.residentialAddress} (ويشار إليه فيما بعد باسم "الطرف الثاني")، أعلن بموجب هذا وأعين الشخص التالي
        //                 بصفته مرشحًا لي فيما يتعلق باستثماري بموجب اتفاقية تمويل المشروع بتاريخ يوم ${day} من ${month}،
        //                 ${year} بيني وبين شركة CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C
        //                 ("الطرف الأول").
        //             </p>
        //         </div>

        //         <div class="section">
        //             <p class="label">Nominee Full Name: ${nomineeDetails.nomineeFullName}</p>
        //             <p class="label">Relationship to Second Party: ${nomineeDetails.relationship}</p>
        //             <p class="label">Emirates ID/Passport No.:${nomineeDetails.emiratesOrPassportId}</p>
        //             <p class="label">Contact Details:${nomineeDetails.contactNumber}</p>

        //             <p class="label">Residential Address:${nomineeDetails.residentialAddress}</p>

        //         </div>
        //         <div class="section arabic">
        //             <label class="label">اسم المرشح الكامل:${nomineeDetails.nomineeFullName}</label>

        //             <label class="label">العلاقة بالطرف الثاني:${nomineeDetails.relationship}</label>

        //             <label class="label">بطاقة الهوية/رقم جواز السفر:${nomineeDetails.emiratesOrPassportId}</label>

        //             <label class="label">تفاصيل الاتصال:${nomineeDetails.contactNumber}</label>

        //             <label class="label">عنوان السكن:${nomineeDetails.residentialAddress}</label>
        //         </div>
        //     </div>

        //     <div class="container">
        //         <div class="section">
        //             <h2>Nominee Rights and Authority:</h2>
        //             <h2 class="arabic">حقوق المرشح وسلطاته:</h2>
        //             <div class="english">
        //                 <p>In the event of my death or incapacitation, my Nominee shall have the following rights and authority
        //                     in relation to my investment:</p>
        //             </div>
        //             <div class="arabic">
        //                 <p>في حالة وفاتي أو عجزي، يتمتع مرشحي بالحقوق والصلاحيات التالية فيما يتعلق باستثماري:</p>
        //             </div>
        //             <div class="english">
        //                 <p>The Nominee shall be entitled to receive all outstanding profits and returns due to me under the
        //                     Project Funding Agreement.</p>
        //             </div>
        //             <div class="arabic">
        //                 <p>يحق للمرشح الحصول على جميع الأرباح والعوائد المستحقة لي بموجب اتفاقية تمويل المشروع.</p>
        //             </div>
        //             <div class="english">
        //                 <p>The Nominee shall have the right to claim and receive the full capital amount invested by me, subject
        //                     to the terms and conditions of the Agreement.</p>
        //             </div>
        //             <div class="arabic">
        //                 <p>يحق للمرشح المطالبة والحصول على كامل مبلغ رأس المال الذي استثمرته، وفقًا للشروط وأحكام الاتفاقية.</p>
        //             </div>
        //             <div class="english">
        //                 <p>The Nominee shall have the authority to represent me and make decisions regarding any legal,
        //                     financial, or administrative matters related to the investment.</p>
        //             </div>
        //             <div class="arabic">
        //                 <p>يتمتع المرشح بسلطة تمثيلي واتخاذ القرارات المتعلقة بأي مسائل قانونية، أو مالية أو إدارية تتعلق
        //                     بالاستثمار.</p>
        //             </div>
        //         </div>

        //         <div class="section">
        //             <h2>Binding Nature of Declaration:</h2>
        //             <h2 class="arabic">الطبيعة الملزمة للإعلان:</h2>
        //             <div class="english">
        //                 <p>
        //                     This Nominee Declaration shall be binding on my legal heirs, executors, administrators, and assigns.
        //                     The appointment of the Nominee shall not be revoked except by a written notice provided to the First
        //                     Party, duly signed by me and acknowledged by the First Party, prior to any event of my death or
        //                     incapacitation.
        //                 </p>
        //             </div>
        //             <div class="arabic">
        //                 <p>
        //                     يجب أن يكون إعلان المرشح هذا ملزمًا لورثتي القانونيين، ومنفذي، وإداريي، والمتنازل لهم. لا يجوز إنهاء
        //                     تعيين المرشح إلا بموجب إشعار كتابي مقدم إلى الطرف الأول، موقع مني حسب الأصول ومعترف به من قبل الطرف
        //                     الأول، قبل أي حالة وفاة أو عجز.
        //                 </p>
        //             </div>
        //         </div>
        //     </div>

        //     <div class="container">
        //         <div class="section">
        //             <h2>Indemnity:</h2>
        //             <h2 class="arabic">التعويض:</h2>
        //             <div class="english">
        //                 <p>
        //                     The First Party is hereby authorized to deal with the Nominee in accordance with this Declaration,
        //                     and the First Party shall not be liable for any actions or omissions taken in good faith in reliance
        //                     on this Declaration.
        //                     The First Party shall be indemnified against any claims, losses, or damages arising from its
        //                     reliance on this Declaration.
        //                 </p>
        //             </div>
        //             <div class="arabic">
        //                 <p>
        //                     يحق للطرف الأول بموجب هذا التعامل مع المرشح وفقًا لهذا الإعلان، ولن يكون الطرف الأول مسؤولًا عن أي
        //                     إجراءات أو
        //                     إغفالات يتم اتخاذها بحسن نية بالاعتماد على هذا الإعلان. يتم تعويض الطرف الأول ضد أي مطالبات أو خسائر
        //                     أو أضرار
        //                     تنشأ عن اعتماده على هذا الإعلان.
        //                 </p>
        //             </div>
        //         </div>

        //         <div class="section">
        //             <h2>Governing Law:</h2>
        //             <h2 class="arabic">القانون الحاكم:</h2>
        //             <div class="english">
        //                 <p>
        //                     This Declaration shall be governed by and construed in accordance with the laws of the United Arab
        //                     Emirates.
        //                 </p>
        //                 <p>
        //                     IN WITNESS WHEREOF, I have signed this Nominee Declaration on this ${day} day of ${month}, ${year}.
        //                 </p>
        //             </div>
        //             <div class="arabic">
        //                 <p>
        //                     يخضع هذا الإعلان ويفسر وفقًا لقوانين دولة الإمارات العربية المتحدة.
        //                 </p>
        //                 <p>
        //                     وإثباتًا لما تقدم، فقد وقعت على إعلان المرشح هذا في ${day} اليوم من ${month}، ${year}.
        //                 </p>
        //             </div>
        //         </div>

        //         <div class="signature-section">
        //             <div class="signature-block">
        //                 <p>[Second Party's Full Name & sign]</p>
        //                 <p>Second Party</p>
        //                 <p class="arabic">الطرف الثاني</p>
        //             </div>
        //             <div class="signature-block">
        //                 <p>[Nominee's Full Name & sign]</p>
        //                 <p>Nominee</p>
        //                 <p class="arabic">مرشح</p>
        //             </div>
        //         </div>
        //     </div>

        // </body>

        // </html>`
        //         let shareAgreement = `<!DOCTYPE html>
        // <html lang="en">
        // <head>
        //     <meta charset="UTF-8">
        //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
        //     <title>Share Transfer Agreement</title>
        //     <style>
        //         body {
        //             font-family: Arial, sans-serif;
        //             line-height: 1.6;
        //             color: #333;
        //             max-width: 800px;
        //             margin: 0 auto;
        //             padding: 20px;
        //         }
        //         .header {
        //             text-align: center;
        //             margin-bottom: 30px;
        //             border-bottom: 2px solid #00529b;
        //             padding-bottom: 10px;
        //         }
        //         h1 {
        //             color: #00529b;
        //             text-transform: uppercase;
        //             font-weight: bold;
        //         }
        //         h2 {
        //             color: #00529b;
        //             border-bottom: 1px solid #ccc;
        //             padding-bottom: 5px;
        //             margin-top: 20px;
        //         }
        //         .parties {
        //             margin: 20px 0;
        //         }
        //         .clause {
        //             margin-bottom: 20px;
        //         }
        //         .indent {
        //             margin-left: 20px;
        //         }
        //         .double-indent {
        //             margin-left: 40px;
        //         }
        //         .signature {
        //             margin-top: 40px;
        //             display: flex;
        //             justify-content: space-between;
        //         }
        //         .signature-box {
        //             border-top: 1px solid #333;
        //             width: 45%;
        //             padding-top: 10px;
        //             text-align: center;
        //         }
        //         .highlight {
        //             font-weight: bold;
        //         }
        //         ul {
        //             list-style-type: none;
        //             padding-left: 20px;
        //         }
        //         li::before {
        //             content: "- ";
        //         }
        //     </style>
        // </head>
        // <body>
        //     <div class="header">
        //         <h1>Share Transfer Agreement</h1>
        //         <p><strong>Contract Date: ${moddate}</strong></p>
        //         <p>Pursuant to the UAE Commercial Companies Law (Federal Law No. 32 of 2021)</p>
        //     </div>

        //     <div class="parties">
        //         <p><strong>Between:</strong></p>
        //         <p>The shareholders of CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C, a company registered in the Emirate of Dubai, United Arab Emirates, under license number 1250854, with its registered office at Business Bay, Dubai, United Arab Emirates.</p>

        //         <p><strong>Transferor:</strong><br>
        //         Ganeshwaran Vijayaratanam Vijayaratanam</p>

        //         <p><strong>Transferee:</strong><br>
        //         ${usernme}</p>
        //     </div>

        //     <div class="clause">
        //         <h2>1. Preamble</h2>
        //         <p>CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C (hereinafter referred to as the "Company") is registered under a license issued by the Dubai Department of Tourism and Economy and is authorized to engage in (investment in technological projects, their establishment, and management / investment in healthcare projects, their establishment, and management / investment in educational projects, their establishment, and management), and other growing industries under license numbers (1250854, 1435972, 53586), in accordance with the laws of the United Arab Emirates, with its principal place of business in Dubai.</p>

        //         <p>The Transferor owns ....% of the share capital of the Company (hereinafter referred to as the "Shares").</p>

        //         <p>The Transferor wishes to transfer ownership of (....) Shares to the Transferee, who has agreed to purchase them under the terms and conditions set forth below.</p>
        //     </div>

        //     <div class="clause">
        //         <h2>2. Definitions</h2>
        //         <p><strong>Shares:</strong> Refers to (....) shares issued by the Company.</p>
        //         <p><strong>Purchase Price:</strong> Refers to the amount of ${investment_amount} AED per share, totaling ${investment_amount} AED.</p>
        //         <p><strong>Board of Directors:</strong> Refers to the Company's governing body responsible for its management and strategic direction.</p>
        //         <p><strong>Fair Market Value:</strong> The value of the Shares as determined by an independent auditor appointed by the Company's Board of Directors, reflecting the prevailing market price at the time of the Withdrawal Notice.</p>
        //         <p><strong>Withdrawal Notice:</strong> A written request by a shareholder to the Company to repurchase their Shares under the terms of this Agreement.</p>
        //         <p><strong>Notice Period:</strong> A period of 3 months if the total capital to be withdrawn is less than 500,000 AED, or 6 months if equal to or exceeding 500,000 AED.</p>
        //     </div>

        //     <div class="clause">
        //         <h2>3. Share Transfer</h2>
        //         <p><strong>Transfer:</strong> The Transferor shall transfer ownership of the Shares to the Transferee on a final and absolute basis, free from any encumbrances, liens, or third-party rights.</p>
        //         <p><strong>Consideration:</strong> The Transferee shall pay the Purchase Price to the Transferor via bank transfer no later than .....</p>
        //         <p><strong>Approval:</strong> This transfer is subject to the approval of the Company's Board of Directors and compliance with the Company's Articles of Association.</p>
        //     </div>

        //     <div class="clause">
        //         <h2>4. Representations and Warranties</h2>

        //         <p class="highlight">By the Transferor:</p>
        //         <div class="indent">
        //             <p>The Transferor represents and warrants that they legally own the Shares, which are duly registered in their name in the Company's records and the Dubai Department of Tourism and Economy.</p>
        //             <p>The Transferor guarantees that the Shares are free from any third-party claims, encumbrances, or legal restrictions.</p>
        //             <p>The Transferor affirms that they have the legal authority to execute this Agreement and will provide all necessary documentation to effect the transfer.</p>
        //             <p>The Transferor warrants that the Company has no undisclosed debts or liabilities as of the transfer date.</p>
        //         </div>

        //         <p class="highlight">By the Transferee:</p>
        //         <div class="indent">
        //             <p>The Transferee represents that they have sufficient financial resources to pay the Purchase Price.</p>
        //             <p>The Transferee acknowledges that they are acquiring the Shares for investment purposes and agree to comply with the Company's membership regulations.</p>
        //             <p>The Transferee confirms that they have conducted due diligence on the legal and financial standing of the Company before signing this Agreement.</p>
        //             <p>The Transferee agrees to bear all government fees associated with the transfer.</p>
        //         </div>
        //     </div>

        //     <div class="clause">
        //         <h2>5. Conditions Precedent</h2>
        //         <ul>
        //             <li>Approval of the Company's Board of Directors for the transfer.</li>
        //             <li>Compliance with pre-emption rights (if any) as stated in the Company's Articles of Association or Shareholders' Agreement.</li>
        //             <li>Either party may terminate this Agreement if the required approvals are not obtained within (60) days from the contract date.</li>
        //         </ul>
        //     </div>

        //     <div class="clause">
        //         <h2>6. Contractual Restrictions</h2>

        //         <p class="highlight">1. Right of First Refusal (ROFR):</p>
        //         <div class="indent">
        //             <p>If the Transferee or any subsequent shareholder intends to sell or transfer any of their shares in the Company to a third party, they must first submit a written offer to the existing shareholders, specifying the number of shares offered, the price, and the terms of sale.</p>
        //             <p>Existing shareholders shall have thirty (30) days from the date of receiving the written offer to exercise their right of first refusal.</p>
        //             <p>If the shareholders do not exercise this right within the specified period, the selling party may proceed with the sale to the third party under the same terms and price offered to the shareholders.</p>
        //         </div>

        //         <p class="highlight">2. Non-Compete Obligation:</p>
        //         <div class="indent">
        //             <p>The Transferor agrees not to engage, directly or indirectly, in any business activity that competes with the Company's operations or invest in any competing entity within the United Arab Emirates or any market where the Company operates, for a period of seven (7) years from the effective date of this Agreement.</p>
        //             <p>This restriction shall not apply to investments in publicly listed companies, provided that the ownership stake does not exceed 5% of the company's shares.</p>
        //         </div>

        //         <p class="highlight">3. Exclusion for Share Withdrawal Under Clause 8:</p>
        //         <div class="indent">
        //             <p>The Right of First Refusal outlined in this Clause shall not apply to any shares repurchased by the Company under the provisions of Clause 8 (Shareholder Withdrawal Rights).</p>
        //         </div>
        //     </div>

        //     <div class="clause">
        //         <h2>7. Shareholder Withdrawal Rights</h2>

        //         <p class="highlight">1. Withdrawal Mechanism:</p>
        //         <div class="indent">
        //             <p>Any shareholder shall have the right to withdraw their capital by requiring the Company to repurchase their shares at Fair Market Value, subject to the following terms and conditions.</p>
        //         </div>

        //         <p class="highlight">2. Withdrawal Notice Requirements:</p>
        //         <div class="indent">
        //             <p>The shareholder must submit a written Withdrawal Notice to the Company's Board of Directors.</p>
        //             <p>The Notice shall specify the following:</p>
        //             <ul class="double-indent">
        //                 <li>The number of shares to be repurchased</li>
        //                 <li>The requested withdrawal dates, provided that such dates shall not be less than three (3) months from the date of the notice</li>
        //                 <li>Supporting documentation evidencing share ownership</li>
        //             </ul>
        //         </div>

        //         <p class="highlight">3. Notice Periods:</p>
        //         <div class="indent">
        //             <p>The notice period shall be three (3) months and shall commence upon the Company's formal acknowledgment of receipt of the Withdrawal Notice.</p>
        //             <p>The Agreement may also be terminated at any time by mutual written agreement between the Parties.</p>
        //         </div>

        //         <p class="highlight">4. Valuation Process:</p>
        //         <div class="indent">
        //             <p>Within 15 business days of receiving the Withdrawal Notice, the Board shall appoint an independent UAE-licensed auditor.</p>
        //             <p>The auditor shall determine the Fair Market Value using:</p>
        //             <ul class="double-indent">
        //                 <li>The average of the last three independent valuations</li>
        //                 <li>The Company's most recent audited financial statements</li>
        //                 <li>Market comparable for similar healthcare investments</li>
        //                 <li>Valuation must be completed within 30 days of appointment</li>
        //             </ul>
        //         </div>

        //         <p class="highlight">5. Payment Terms:</p>
        //         <div class="indent">
        //             <p>Payment shall be made in AED by bank transfer.</p>
        //             <p>The full payment shall be made within fifteen (15) days from the end of the notice period.</p>
        //         </div>

        //         <p class="highlight">6. Conditions and Limitations:</p>
        //         <div class="indent">
        //             <p>The Company may refuse repurchase if it would:</p>
        //             <ul class="double-indent">
        //                 <li>Violate UAE capital maintenance requirements</li>
        //                 <li>Endanger the Company's financial stability</li>
        //                 <li>Contravene any existing financing covenants</li>
        //                 <li>Maximum annual repurchase limit: 15% of total issued shares</li>
        //             </ul>
        //         </div>

        //         <p class="highlight">7. Effect of Withdrawal:</p>
        //         <div class="indent">
        //             <ul>
        //                 <li>Repurchased shares shall be automatically canceled.</li>
        //                 <li>The shareholder's rights shall terminate and profit distributions shall immediately cease. The shareholder shall not be entitled to any distributions or profits resulting from the final business cycle.</li>
        //                 <li>The Company shall update its commercial license and share register accordingly. All related fees and expenses shall be borne solely by the shareholder.</li>
        //             </ul>
        //         </div>

        //         <p class="highlight">8. Dispute Resolution:</p>
        //         <div class="indent">
        //             <ul>
        //                 <li>Any valuation disputes shall be resolved by the DIFC Courts</li>
        //                 <li>The Company shall bear the costs of the initial valuation</li>
        //                 <li>The challenging party bears costs of any subsequent valuations</li>
        //             </ul>
        //         </div>
        //     </div>

        //     <div class="clause">
        //         <h2>8. Confidentiality</h2>
        //         <p>Both parties agree not to disclose the details of this Agreement or use any confidential information related to the Company, including financial data, client lists, and business strategies, for any third party.</p>
        //     </div>

        //     <div class="clause">
        //         <h2>9. Notices</h2>
        //         <p>Any written notices shall be sent to the registered addresses of the parties as stated in this Agreement.</p>
        //     </div>

        //     <div class="clause">
        //         <h2>10. Severability</h2>
        //         <p>If any provision of this Agreement is found to be invalid or unenforceable under applicable laws, the remaining provisions shall remain in full force and effect.</p>
        //     </div>

        //     <div class="signature">
        //         <div class="signature-box">
        //             <p><strong>Transferor:</strong><br>
        //             Ganeshwaran Vijayaratanam Vijayaratanam</p>
        //             <p>_________________________</p>
        //         </div>
        //         <div class="signature-box">
        //             <p><strong>Transferee:</strong><br>
        //             ...........................</p>
        //             <p>_________________________</p>
        //         </div>
        //     </div>
        // </body>
        // </html>`
        // var save = await model.getBankaccount(bankAccount)
        // if (securityOption.toUpperCase() !== "INSURANCE") {
        //     let html = securityOption.toUpperCase() === "SHARES" ? shareAgreement : notarizationAgreement
        //     var pdf = await createPdfWithPuppeteer(html, fullPath);
        // }
        let nomineeId = nomineeData ? nomineeData[0]?.n_id : createdNominee?.insertId
        let paymentMode = null
        if (payment_method === "wallet") {
            await model.UpdateWalletPayment(user_id, investment_amount)
            paymentMode = "through_wallet"
        } else {
            paymentMode = "through_bank"
        }
        console.log("bankaccount : ", bankaccount)
        var saveInvest = await orderModel.AddInvest(user_id, date, investment_duration, investment_amount, percentage, return_amount, profit_model, securityOption, project_name, withdrawal_frequency, bankaccount[0]?.b_id, nomineeId, "future_invest", paymentMode)
        await SendMessage(user_id, "CWI Investment", "CWI Investment added successfully.!")
        await sendNotificationToAdmins("CWI Investment", `${userdetails[0].u_name} requested to invest in CWI Investment`)
        await notification.addNotification(user_id, userdetails[0].u_role, 'CWI Investment', 'CWI Investment added successfully')
        const relativeUrl = securityOption.toUpperCase() === "SHARES" ? `/uploads/insurance/SHARE TRANSFER AGREEMENT.pdf` : securityOption.toUpperCase() === "INSURANCE" ? `/uploads/insurance/Insurance _CWI.pdf` : `/uploads/insurance/Financing Agreement CWI.pdf`

        return res.send({
            result: true,
            message: "order success",
            contract_id: saveInvest.insertId,
            path: `${req.protocol}://${req.get('host')}${relativeUrl}`
        });
    } catch (error) {
        console.log(error);
        return res.send({
            result: false,
            message: error.message
        })
    }
}