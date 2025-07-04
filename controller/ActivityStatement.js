var walletModel = require('../model/wallettransaction')
var contractModel = require('../model/UserContractList')
var transferModel = require('../model/contracttransfer')
var referralModel = require('../model/referralBonus')
var userModel = require('../model/users')
const fs = require('fs')
const path = require('path');
const exceljs = require('exceljs');
let moment = require('moment')
let { createPdfWithPuppeteer } = require('../util/pdfGeneration')

module.exports.downloadStatement = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({ result: false, message: "User id not found" })
        }
        let { monthsAgo } = req.query
        if (!monthsAgo) {
            monthsAgo = 0
        }
        let { type } = req.body
        if (!type) {
            return res.send({ result: false, message: "Type is required" })
        }
        let data = []
        if (type === "all") {
            let walletData = await walletModel.Getwallet(user_id)
            let contractsData = await contractModel.GetUserContractList(user_id)
            let withdrawData = await contractModel.GetUserWithdraw(user_id)
            let transferData = await transferModel.getInvestedData(user_id)
            let refferalData = await referralModel.getReferralBonus(user_id)
            data = [...contractsData, ...withdrawData, ...walletData, ...transferData, ...refferalData].sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || a.date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || b.date || 0);
                return dateB - dateA;
            });
        } else if (type === "profit") {
            let contractsData = await contractModel.GetUserContractList(user_id)
            data = contractsData.sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                return dateB - dateA;
            })
        } else if (type === "withdraw") {
            let withdrawData = await contractModel.GetUserWithdraw(user_id)
            data = withdrawData.sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                return dateB - dateA;
            })
        } else if (type === "transfer") {
            let transferData = await transferModel.getInvestedData(user_id)
            data = transferData
                .filter(el => el.ui_status === "requestedForTransfer" || el.ui_status === "transfered")
                .sort((a, b) => {
                    const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                    const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                    return dateB - dateA;
                });

        } else if (type === "termination") {
            let transferData = await transferModel.getInvestedData(user_id)
            data = transferData
                .filter(el => el.ui_status === "terminated" || el.ui_status === "requestedForTermination")
                .sort((a, b) => {
                    const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                    const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                    return dateB - dateA;
                });
        } else if (type === "referral") {
            let refferalData = await referralModel.getReferralBonus(user_id)
            data = refferalData.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA;
            })
        } else {
            res.send({ result: false, message: "Invalid type" })
        }
        if (data.length > 0) {
            let currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() - monthsAgo); // Subtract months

            // Format the currentDate to be comparable (in UTC format)
            let filterDate = currentDate.toISOString();
            let filteredData = data.filter((el) => {
                // Check if it's a withdrawal (wr_* fields)
                if (el.wr_id) {
                    return new Date(el.wr_date) >= new Date(filterDate);
                }
                // Check if it's an investment (ui_* fields)
                else if (el.ui_id) {
                    return new Date(el.ui_date) >= new Date(filterDate);
                }
                return false; // Return false if it's neither
            });

            let user = await userModel.getUser(user_id)
            // Set base uploads directory (EBS)
            const baseUploadsDir = '/mnt/ebs500/uploads/statements';

            // Ensure the folder exists
            if (!fs.existsSync(baseUploadsDir)) {
                fs.mkdirSync(baseUploadsDir, { recursive: true });
            }

            const timestamp = Date.now();
            const sanitizedUsername = user[0].u_name.replace(/\s+/g, '_'); // Ensure safe filename
            const outputFilePath = path.join(baseUploadsDir, `activity_statement_user_${sanitizedUsername}_${timestamp}.xlsx`);

            // Create a new workbook and add a worksheet
            const workbook = new exceljs.Workbook();
            const worksheet = workbook.addWorksheet(`Activity Statement ${user[0].u_name}`);

            // Add headings and format the first section (similar to 'Withdraw Request' in previous code)
            let headingRow1 = worksheet.addRow(['Activity Statement']);
            worksheet.mergeCells('A1:E1');
            headingRow1.getCell(1).font = { bold: true, size: 16, name: 'Liberation Serif' };
            headingRow1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            let headingRow2 = worksheet.addRow(["SL NO.", "TYPE", "AMOUNT", "STATUS", "DATE"]);
            headingRow2.getCell(1).font = { bold: true, size: 14, name: 'Liberation Serif' };
            headingRow2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.addRow([]); // Empty row for spacing

            worksheet.columns = [
                { key: 'sl_no', width: 7 },
                { key: 'type', width: 15 },
                { key: 'amount', width: 24 },
                { key: 'status', width: 15 },
                { key: 'date', width: 21 },
            ];

            // Add data rows to the worksheet
            filteredData.forEach((el, index) => {
                if (el.wr_id) {
                    // Add withdraw data to the worksheet
                    worksheet.addRow([
                        index + 1, // Serial Number
                        'Withdraw', // Type
                        el.wr_amount, // Amount
                        el.wr_status, // Status
                        el.wr_date,   // Date
                    ]);
                } else if (el.ui_id) {
                    // Add investment data to the worksheet
                    worksheet.addRow([
                        index + 1, // Serial Number
                        'Invest', // Type
                        el.ui_amount, // Amount
                        el.ui_status, // Status
                        el.ui_date,   // Date
                    ]);
                }
            });

            // Write the workbook to the file
            workbook.xlsx.writeFile(outputFilePath)
            return res.send({
                result: true,
                message: "data retrieved",
                file: req.protocol + "://" + req.get("host") + outputFilePath.replace(process.cwd(), '')
            })
        } else {
            return res.send({
                result: false,
                message: "No data found"
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.downloadStatementPdf = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({ result: false, message: "User id not found" })
        }
        let { monthsAgo } = req.query
        if (!monthsAgo) {
            monthsAgo = 0
        }
        let { type } = req.body
        if (!type) {
            return res.send({ result: false, message: "Type is required" })
        }
        let bankData = await contractModel.GetBankData(user_id)
        let data = []
        if (type === "all") {
            let walletData = await walletModel.Getwallet(user_id)
            let contractsData = await contractModel.GetUserContractList(user_id)
            let withdrawData = await contractModel.GetUserWithdraw(user_id)
            let transferData = await transferModel.getInvestedData(user_id)
            let refferalData = await referralModel.getReferralBonus(user_id)
            data = [...contractsData, ...withdrawData, ...walletData, ...transferData, ...refferalData].sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || a.date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || b.date || 0);
                return dateB - dateA;
            });
        } else if (type === "profit") {
            let contractsData = await contractModel.GetUserContractList(user_id)
            data = contractsData.sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                return dateB - dateA;
            })
        } else if (type === "withdraw") {
            let withdrawData = await contractModel.GetUserWithdraw(user_id)
            data = withdrawData.sort((a, b) => {
                const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                return dateB - dateA;
            })
        } else if (type === "transfer") {
            let transferData = await transferModel.getInvestedData(user_id)
            data = transferData
                .filter(el => el.ui_request === "requestedForTransfer" || el.ui_request === "transfered")
                .sort((a, b) => {
                    const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                    const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                    return dateB - dateA;
                });

        } else if (type === "termination") {
            let transferData = await transferModel.getInvestedData(user_id)
            data = transferData
                .filter(el => el.ui_request === "terminated" || el.ui_request === "requestedForTermination")
                .sort((a, b) => {
                    const dateA = new Date(a.ui_date || a.wr_date || a.w_date || 0);
                    const dateB = new Date(b.ui_date || b.wr_date || b.w_date || 0);
                    return dateB - dateA;
                });
        } else if (type === "referral") {
            let refferalData = await referralModel.getReferralBonus(user_id)
            data = refferalData.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA;
            })
        } else {
            res.send({ result: false, message: "Invalid type" })
        }
        if (data.length > 0) {
            let currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() - monthsAgo); // Subtract months

            // Format the currentDate to be comparable (in UTC format)
            let filterDate = currentDate.toISOString();
            let filteredData = data.filter((el) => {
                // Check if it's a withdrawal (wr_* fields)
                if (el.wr_id) {
                    return new Date(el.wr_date) >= new Date(filterDate);
                }
                // Check if it's an investment (ui_* fields)
                else if (el.ui_id) {
                    return new Date(el.ui_date) >= new Date(filterDate);
                }
                return false; // Return false if it's neither
            });
            let user = await userModel.getUser(user_id)
            // Use centralized EBS-mounted directory
            const baseDir = '/mnt/ebs500/uploads/statements';

            // Ensure the folder exists
            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
            }

            const timestamp = Date.now();
            const sanitizedUsername = user[0].u_name.replace(/\s+/g, '_'); // Avoid spaces in filename
            const outputFilePath = path.join(baseDir, `activity_statement_user_${sanitizedUsername}_${timestamp}.pdf`);

            let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coral Investment User Activity Statement</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 9px;
            line-height: 1.2;
            background: #f5f5f5;
            color: black;
        }

        .watermark-text {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 6em;
            color: rgba(0, 0, 0, 0.05);
            text-transform: uppercase;
            white-space: nowrap;
            pointer-events: none;
            z-index: -1;
        }

        .header {
            background: linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%);
            padding: 20px 0;
            margin-bottom: 30px;
            width: 100%;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }

        .header img {
            width: 180px;
            height: auto;
            max-width: 100%;
        }
        
        .page {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            border-radius: 8px;
            page-break-after: always;
        }

        @media print {
            body {
                background: white;
            }
            .page {
                box-shadow: none;
                margin: 0;
                border-radius: 0;
                page-break-after: always;
            }
        }
        
        /* Page 1 Styles */
        .summary-header {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 25px;
            color: #333;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .summary-table th,
        .summary-table td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: left;
            font-size: 11px;
        }
        
        .summary-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        
        .summary-table .balance {
            text-align: center;
            font-weight: bold;
            color: #2c5530;
        }
        
        /* Company Info */
        .company-info {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 20px;
            line-height: 1.4;
            color: #1565c0;
        }
        
        .company-info span {
            font-size: 14px;
            display: block;
            margin-bottom: 8px;
        }
        
        .statement-header {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 25px;
            color: #333;
        }
        
        .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 10px;
        }
        
        .transactions-table th,
        .transactions-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        
        .transactions-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: center;
            color: #333;
        }
        
        .transactions-table .amount-col,
        .transactions-table .balance-col {
            text-align: right;
            width: 90px;
        }
        
        .transactions-table .date-col {
            width: 90px;
        }
        
        .transactions-table .ref-col {
            width: 100px;
        }
        
        /* Account Details Section */
        .account-details-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
        }
        
        .account-details-left {
            width: 55%;
            font-size: 10px;
        }
        
        .account-details-right {
            width: 40%;
            font-size: 11px;
            font-weight: bold;
            text-align: left;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
        }
        
        .account-detail-row {
            margin-bottom: 4px;
            line-height: 1.4;
        }
        
        .account-label {
            font-weight: bold;
            display: inline-block;
            vertical-align: top;
            width: 140px;
            color: #555;
        }
        
        .account-value {
            display: inline-block;
            vertical-align: top;
            color: #333;
        }
        
        .account-holder-name {
            font-weight: bold;
            color: #1565c0;
        }
        
        /* Footer Styles */
        .footer {
            margin-top: 40px;
            font-size: 9px;
            line-height: 1.4;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        
        .digital-stamp {
            font-style: italic;
            margin-bottom: 15px;
            color: #666;
        }
        
        .copyright {
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
        }
        
        .terms {
            margin-bottom: 12px;
            color: #555;
        }
        
        .arabic-text {
            direction: rtl;
            text-align: right;
            margin-bottom: 15px;
            color: #555;
            font-family: 'Arial Unicode MS', Arial, sans-serif;
        }
        
        .notice {
            margin-bottom: 15px;
            color: #555;
            line-height: 1.5;
        }
        
        .page-number {
            text-align: center;
            margin-top: 20px;
            font-size: 9px;
            color: #666;
            font-weight: bold;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .page {
                margin: 10px;
                padding: 15px;
            }
            
            .account-details-section {
                flex-direction: column;
            }
            
            .account-details-left,
            .account-details-right {
                width: 100%;
            }
            
            .transactions-table {
                font-size: 9px;
            }
            
            .transactions-table th,
            .transactions-table td {
                padding: 6px 4px;
            }
        }

        .no-data {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
    </style>
</head>
<body>

<!-- Page 1: Summary -->
<div class="page">
    <div class="watermark-text">CORAL WEALTH</div>
    <div class="header">
        <img src="https://coral.lunarsenterprises.com/uploads/agreement_needs/coraluae.webp" alt="Coral Wealth Investment Logo">
    </div>
    
    <div class="company-info">
        <span>CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C</span>
        IFZA, A2 Building, Dubai Digital Park, DSO Office 606<br>
        Regal Tower, Business Bay,<br>
        Dubai, United Arab Emirates
    </div>
    
    <div class="summary-header">Summary of Accounts</div>
    
    <table class="summary-table">
        <thead>
            <tr>
                <th>ACCOUNT HOLDER</th>
                <th>ACCOUNT NUMBER</th>
                <th>ACCOUNT IFSC CODE</th>
                <th>ACCOUNT CURRENCY</th>
                <th>CLOSING BALANCE</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${bankData[0]?.b_name_as}</td>
                <td>${bankData[0]?.b_account_no}</td>
                <td>${bankData[0]?.b_ifsc_code}</td>
                <td>${bankData[0]?.b_currency}</td>
                <td class="balance">${user[0]?.u_wallet} AED</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <div class="digital-stamp">This is a digital stamp and does not require signature.</div>
        
        <div class="copyright">© 2025 Coral Wealth Investment, Dubai</div>
        <div class="terms">Coral Wealth Standard Terms and Conditions are applicable</div>
        
        <div class="arabic-text">
            كورال ويلث إنفستمنت، دبي<br>
            تنطبق الشروط والأحكام القياسية لشركة كورال ويلث
        </div>
        
        <div class="notice">
            Please review this activity statement and report any discrepancies within 30 days.<br>
            If no issues are reported, the statement will be considered correct (subject to the Bank's right to correct errors).<br>
            For assistance, contact Coral Wealth customer service at 600 500 946.
        </div>
        
        <div class="arabic-text">
            يرجى مراجعة كشف الحساب هذا والإبلاغ عن أي اختلافات في غضون 30 يوماً. في حال لم يتم الإبلاغ عن أي مشاكل، فسيتم اعتبار البيان صحيحاً (خاضع لحق شركة كورال ويلث في تصحيح الأخطاء).<br>
            للمساعدة، تواصل مع خدمة عملاء كورال ويلث على 946 500 600
        </div>
        
        <div class="page-number">Page 1 of 2</div>
    </div>
</div>

<!-- Page 2: AED Activity Statement -->
<div class="page">
    <div class="company-info">
        <span>CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C</span>
        IFZA, A2 Building, Dubai Digital Park, DSO Office 606<br>
        Regal Tower, Business Bay,<br>
        Dubai, United Arab Emirates
    </div>

    <div class="statement-header">
        ACTIVITY STATEMENT<br>
        ${monthsAgo ? `LAST ${monthsAgo} months` : ""}
    </div>

    <table class="transactions-table">
        <thead>
            <tr>
                <th class="date-col">Invested Date</th>
                <th class="ref-col">Expiry Date</th>
                <th>Project</th>
                <th class="amount-col">Amount<br>(Incl. VAT)</th>
                <th class="balance-col">Return<br>(AED)</th>
                <th class="balance-col">Request<br></th>
                <th class="balance-col">Request Status<br></th>
            </tr>
        </thead>
        <tbody>
        ${filteredData.map(item => {
                return item.ui_id ?
                    `
            <tr>
            <td>${moment(item.ui_date).format('DD/MM/YYYY')}</td>
            <td>${moment(item.ui_duration).format('DD/MM/YYYY')}</td>
            <td>${item.ui_project_name}</td>
            <td class="amount-col">${item.ui_amount}</td>
            <td class="balance-col">${item.ui_return}</td>
            <td class="balance-col">${item.ui_request ?? ""}</td>
            <td class="balance-col">${item.ui_request_status === "pending" ? "" : item.ui_request_status}</td>
            </tr>        `
                    : ''
            }
            ).join('')}
        </tbody>
    </table>

    <table class="transactions-table">
        <thead>
            <tr>
                <th class="date-col">Withdraw Date</th>
                <th class="amount-col">Amount<br>(Incl. VAT)</th>
                <th class="balance-col">Request Status<br></th>
            </tr>
        </thead>
        <tbody>
        ${filteredData.map(item => {
                return item.wr_id ?
                    `
            <tr>
            <td>${moment(item.wr_date).format('DD/MM/YYYY')}</td>
            <td class="amount-col">${item.wr_amount}</td>
            <td class="balance-col">${item.wr_status}</td>
            </tr>
            `: ""
            }
            ).join('')}
        </tbody>
    </table>

    <!-- Account Details Section for AED Account -->
    <div class="account-details-section">
        <div class="account-details-left">
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT HOLDER NAME</span>
            </div>
            <div class="account-detail-row account-holder-name">
               ${user[0]?.u_name} <br>
               ${user[0]?.u_email} <br>
               ${user[0]?.u_mobile} <br>
            </div>
            <br>
            <div class="account-detail-row">
                <span class="account-label">CURRENCY</span>
                <span class="account-value">${user[0]?.u_currency}</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT TYPE</span>
                <span class="account-value">CURRENT_ACCOUNT</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT NAME</span>
                ${bankData[0]?.b_name_as}
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT NUMBER</span>
                <span class="account-value">${bankData[0]?.b_account_no}</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT OPENED</span>
                <span class="account-value">${moment(user[0]?.u_joining_date).format('DD/MM/YYYY')}</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">IFSC</span>
                <span class="account-value">${bankData[0]?.b_ifsc_code}</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">CLOSING BALANCE</span>
                <span class="account-value">${user[0]?.u_wallet}</span>
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="digital-stamp">This is a digital stamp and does not require signature.</div>
        
        <div class="copyright">© 2025 Coral Wealth Investment, Dubai</div>
        <div class="terms">Coral Wealth Standard Terms and Conditions are applicable</div>
        
        <div class="arabic-text">
            كورال ويلث إنفستمنت، دبي<br>
            تنطبق الشروط والأحكام القياسية لشركة كورال ويلث
        </div>
        
        <div class="notice">
            Please review this activity statement and report any discrepancies within 30 days.<br>
            If no issues are reported, the statement will be considered correct (subject to the Bank's right to correct errors).<br>
            For assistance, contact Coral Wealth customer service at 600 500 946.
        </div>
        
        <div class="arabic-text">
            يرجى مراجعة كشف الحساب هذا والإبلاغ عن أي اختلافات في غضون 30 يوماً. في حال لم يتم الإبلاغ عن أي مشاكل، فسيتم اعتبار البيان صحيحاً (خاضع لحق شركة كورال ويلث في تصحيح الأخطاء).<br>
            للمساعدة، تواصل مع خدمة عملاء كورال ويلث على 946 500 600
        </div>
        
        <div class="page-number">Page 2 of 2</div>
    </div>
</div>

</body>
</html>`
            await createPdfWithPuppeteer(html, outputFilePath)
            const publicUrlPath = `/uploads/statements/activity_statement_user_${sanitizedUsername}_${timestamp}.pdf`;
            return res.send({
                result: true,
                message: "PDF generated successfully",
                file: `${req.protocol}://${req.get("host")}${publicUrlPath}`
            });
        } else {
            return res.send({
                result: false,
                message: "No data found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}