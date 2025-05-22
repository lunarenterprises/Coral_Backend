var model = require('../model/profitStatement')
const fs = require('fs')
const path = require('path');
const exceljs = require('exceljs');
const moment = require('moment')

module.exports.downloadStatementExcel = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "user id is required"
            })
        }
        let { monthsAgo } = req.query
        let data = await model.getProfitStatement(user_id, monthsAgo)
        if (data.length > 0) {
            let user = await model.getUser(user_id)
            const dirname = path.join(__dirname, '../uploads/statements'); // Corrected path
            const timestamp = Date.now(); // Get the current timestamp
            const outputFilePath = path.join(dirname, `profit_statement_user_${user[0].u_name}_${timestamp}.xlsx`); // Full file path

            // Ensure the folder exists
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname, { recursive: true }); // Create directories recursively
            }

            // Create a new workbook and add a worksheet
            const workbook = new exceljs.Workbook();
            const worksheet = workbook.addWorksheet(`Profit Statement ${user[0].u_name}`);

            // Add headings and format the first section (similar to 'Withdraw Request' in previous code)
            let headingRow1 = worksheet.addRow(['Profit Statement']);
            worksheet.mergeCells('A1:J1');
            headingRow1.getCell(1).font = { bold: true, size: 16, name: 'Liberation Serif' };
            headingRow1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            let headingRow2 = worksheet.addRow(["SL NO.", "INVESTED DATE", "INVESTED DURATION", "INVESTED AMOUNT", "INVESTED PERCENTAGE", "INVESTED RETURN", "INVESTED TYPE", "INVESTED STATUS", "INVESTED SECURITY", "INVESTED PROJECT"]);
            headingRow2.getCell(1).font = { bold: true, size: 14, name: 'Liberation Serif' };
            headingRow2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.addRow([]); // Empty row for spacing

            worksheet.columns = [
                { key: 'sl_no', width: 7 },
                { key: 'ui_date', width: 21 },
                { key: 'ui_duration', width: 18 },
                { key: 'ui_amount', width: 24 },
                { key: 'ui_percentage', width: 24 },
                { key: 'ui_return', width: 13 },
                { key: 'ui_type', width: 13 },
                { key: 'ui_status', width: 13 },
                { key: 'ui_security_option', width: 13 },
                { key: 'ui_project_name', width: 13 },

            ];

            // Add data rows to the worksheet
            data.forEach((el, index) => {
                worksheet.addRow([
                    index + 1,
                    el.ui_date,
                    el.ui_duration,
                    el.ui_amount,
                    el.ui_percentage,
                    el.ui_return,
                    el.ui_type,
                    el.ui_status,
                    el.ui_security_option,
                    el.ui_project_name
                ]);
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
            return res.send({
                result: false,
                message: "user id is required"
            })
        }
        let user = await model.getUser(user_id)
        if (user.length === 0) {
            return res.send({
                result: false,
                message: "User not found"
            })
        }
        let { monthsAgo } = req.query
        let data = await model.getProfitStatement(user_id, monthsAgo)
        if (data.length > 0) {
            let bankData = await model.GetBankData(user_id)
            const dirname = path.join(__dirname, '../uploads/statements'); // Corrected path
            const timestamp = Date.now(); // Get the current timestamp
            const outputFilePath = path.join(dirname, `profit_statement_user_${user[0].u_name}_${timestamp}.pdf`); // Full file path

            // Ensure the folder exists
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname, { recursive: true }); // Create directories recursively
            }
            let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coral Investment User Bank Statement</title>
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
            background: white;
            color: black;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 20px auto;
            padding: 20mm;
            background: white;
        }
        
        /* Page 1 Styles */
        .summary-header {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 25px;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .summary-table th,
        .summary-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-size: 10px;
        }
        
        .summary-table th {
            background-color: #fff;
            font-weight: bold;
        }
        
        .summary-table .balance {
            text-align: center;
            font-weight: bold;
        }
        
        /* Page 2 & 3 Styles */
        .company-info {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 20px;
            line-height: 1.3;
            color:blue;
        }
        
        .company-info span{
            font-size:14px;
        }
        
        .statement-header {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 25px;
        }
        
        .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 9px;
        }
        
        .transactions-table th,
        .transactions-table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
            vertical-align: top;
        }
        
        .transactions-table th {
            background-color: #fff;
            font-weight: bold;
            text-align: center;
        }
        
        .transactions-table .amount-col {
            text-align: right;
            width: 90px;
        }
        
        .transactions-table .balance-col {
            text-align: right;
            width: 90px;
        }
        
        .transactions-table .date-col {
            width: 70px;
        }
        
        .transactions-table .ref-col {
            width: 85px;
        }
        
        /* Account Details Section at bottom of pages */
        .account-details-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        
        .account-details-left {
            width: 48%;
            font-size: 9px;
        }
        
        .account-details-right {
            width: 48%;
            font-size: 10px;
            font-weight: bold;
            text-align: left;
        }
        
        .account-detail-row {
            margin-bottom: 2px;
            line-height: 1.3;
        }
        
        .account-label {
            font-weight: bold;
            display: inline-block;
            vertical-align: top;
            width: 140px;
        }
        
        .account-value {
            display: inline-block;
            vertical-align: top;
        }
        
        .account-holder-name {
            font-weight: bold;
        }
        
        /* Footer Styles */
        .footer {
            position: absolute;
            bottom: 20mm;
            left: 20mm;
            right: 20mm;
            font-size: 8px;
            line-height: 1.4;
        }
        
        .digital-stamp {
            font-style: italic;
            margin-bottom: 15px;
        }
        
        .copyright {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .terms {
            margin-bottom: 10px;
        }
        
        .arabic-text {
            direction: rtl;
            text-align: right;
            margin-bottom: 15px;
        }
        
        .notice {
            margin-bottom: 10px;
        }
        
        .page-number {
            text-align: center;
            margin-top: 20px;
            font-size: 8px;
        }
        
        .page {
            position: relative;
            min-height: 297mm;
        }
    </style>
</head>
<body>

<!-- Page 1: Summary -->
<div class="page">
<div class="header">
            <img src="https://lunarsenterprises.com:6017/uploads/agreement_needs/coraluae.webp" alt="Coral Wealth Investment Logo">
            <!-- Replace with your logo file -->
        </div>
    <div class="company-info">
        <span>
  CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C
</span><br>
        IFZA, A2 Building, Dubai Digital Park, DSO
Office 606<br>
        Regal Tower, Business Bay,<br>
        Dubai, United Arab Emirates
    </div>
    
    <div class="summary-header">Summary of Accounts</div>
    
    <table class="summary-table">
        <thead>
            <tr>
                <th>ACCOUNT NUMBER</th>
                <th>ACCOUNT IFSC CODE</th>
                <th>ACCOUNT CURRENCY</th>
                <th>CLOSING BALANCE</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${bankData[0]?.b_account_no}</td>
                <td>${bankData[0]?.b_ifsc_code}</td>
                <td>${bankData[0]?.b_currency}</td>
                <td class="balance">${user[0]?.u_wallet} AED</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <div class="digital-stamp">This is a digital stamp and<br>does not require signature.</div>
        
        <div class="copyright">© 2025 Coral Wealth Investment, Dubai</div>
        <div class="terms">Coral Wealth Standard Terms and Conditions are applicable</div>
        
        <div class="arabic-text">
            كورال ويلث إنفستمنت، دبي<br>
تنطبق الشروط والأحكام القياسية لشركة كورال ويلث
        </div>
        
        <div class="notice">
            Please review this account statement and report any discrepancies within 30 days.<br>
            If no issues are reported, the statement will be considered correct (subject to the Bank's right to correct errors).<br>
            For assistance, contact Coral Wealth customer service at 600 500 946.
        </div>
        
        <div class="arabic-text">
    يرجى مراجعة كشف الحساب هذا والإبلاغ عن أي اختلافات في غضون 30 يوماً. في حال لم يتم الإبلاغ عن أي مشاكل، فسيتم اعتبار البيان صحيحاً (خاضع لحق شركة كورال ويلث في تصحيح الأخطاء).<br>
    للمساعدة، تواصل مع خدمة عملاء كورال ويلث على 946 500 600
</div>

        
        <div class="page-number">Page 1 of 3</div>
    </div>
</div>

<!-- Page 2: AED Account Statement -->
<div class="page">
    <div class="company-info">
        CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C<br>
        IFZA, A2 Building, Dubai Digital Park, DSO
Office 606<br>
        Regal Tower, Business Bay,<br>
        Dubai, United Arab Emirates
    </div>

    <div class="statement-header">
        ACCOUNT STATEMENT<br>
        LAST ${monthsAgo} months
    </div>

    <table class="transactions-table">
        <thead>
            <tr>
                <th class="date-col">Invested Date</th>
                <th class="ref-col">Expiry Date</th>
                <th>Project</th>
                <th class="amount-col">Amount<br>(Incl. VAT)</th>
                <th class="balance-col">Return<br>(AED)</th>
            </tr>
        </thead>
        <tbody>
        ${data.map(item => `
            <tr>
                <td>${moment(item.ui_date).format('DD/MM/YYYY')}</td>
                <td>${moment(item.ui_duration).format('DD/MM/YYYY')}</td>
                <td>${item.ui_project_name}</td>
                <td class="amount-col">${item.ui_amount}</td>
                <td class="balance-col">${item.ui_return}</td>
            </tr>
        `).join('')}
        </tbody>
    </table>

    <!-- Account Details Section for AED Account -->
    <div class="account-details-section">
        <div class="account-details-left">
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT HOLDER NAME</span>
            </div>
            <div class="account-detail-row account-holder-name">
                CORAL WEALTH INVESTMENT <br>
                HEALTHCARE ENTERPRISES <br>
                DEVELOPMENT<br>
                TRAINING CO. L.L.C
            </div>
            <br>
            <div class="account-detail-row">
                <span class="account-label">CURRENCY</span>
                <span class="account-value">AED</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">INTEREST RATE</span>
                <span class="account-value">0%</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT TYPE</span>
                <span class="account-value">CURRENT_ACCOUNT</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT NAME</span>
            </div>
            <div class="account-detail-row">
                CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES DEVELOPMENT CO. L.L.C
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT NUMBER</span>
                <span class="account-value">9076680104</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT OPENED</span>
                <span class="account-value">10/08/2023</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">IBAN</span>
                <span class="account-value">AE810860000009076680104</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">OPENING BALANCE</span>
                <span class="account-value">27,735.26</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">CLOSING BALANCE</span>
                <span class="account-value">7,319.47</span>
            </div>
        </div>
        <div class="account-details-right">
            ACCOUNT STATEMENT<br>
            FROM 01/05/2025 TO 15/05/2025<br><br>
            CORAL WEALTH INVESTMENT <br> HEALTHCARE ENTERPRISES <br>
             DEVELOPMENT CO. L.L.C<br>
            IFZA, A2 Building, Dubai Digital Park, DSO
Office 606<br>
            Regal Tower,<br>
             Business Bay, Dubai, United Arab Emirates
        </div>
    </div>

    <div class="footer">
        <div class="digital-stamp">This is a digital stamp and<br>does not require signature.</div>
        
        <div class="copyright">© 2025 Coral Wealth investment, Dubai</div>
        <div class="terms">Coral Wealth Standard Terms and Conditions are applicable</div>
        
        <div class="arabic-text">
            كورال ويلث إنفستمنت، دبي<br>
تنطبق الشروط والأحكام القياسية لشركة كورال ويلث
        </div>
        
        <div class="notice">
            Please review this account statement and report any discrepancies within 30 days.<br>
            If no issues are reported, the statement will be considered correct (subject to the Bank's right to correct errors).<br>
            For assistance, contact Coral Wealth customer service at 600 500 946.
        </div>
        
       <div class="arabic-text">
    يرجى مراجعة كشف الحساب هذا والإبلاغ عن أي اختلافات في غضون 30 يوماً. في حال لم يتم الإبلاغ عن أي مشاكل، فسيتم اعتبار البيان صحيحاً (خاضع لحق شركة كورال ويلث في تصحيح الأخطاء).<br>
    للمساعدة، تواصل مع خدمة عملاء كورال ويلث على 946 500 600
</div>

        
        <div class="page-number">Page 2 of 3</div>
    </div>
</div>

<!-- Page 3: USD Account Statement -->
<div class="page">
    <div class="company-info">
        CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C<br>
        IFZA, A2 Building, Dubai Digital Park, DSO
Office 606<br>
        Regal Tower, Business Bay,<br>
        Dubai, United Arab Emirates
    </div>

    <div class="statement-header">
        ACCOUNT STATEMENT<br>
        FROM 01/05/2025 TO 15/05/2025
    </div>

    <table class="transactions-table">
        <thead>
            <tr>
                <th class="date-col">Date</th>
                <th class="ref-col">Ref. Number</th>
                <th>Description</th>
                <th class="amount-col">Amount<br>(Incl. VAT)</th>
                <th class="balance-col">Balance<br>(USD)</th>
            </tr>
        </thead>
        <tbody>
            <!-- Empty table for USD account -->
        </tbody>
    </table>

    <!-- Account Details Section for USD Account -->
    <div class="account-details-section">
        <div class="account-details-left">
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT HOLDER NAME</span>
            </div>
            <div class="account-detail-row account-holder-name">
                CORAL WEALTH INVESTMENT<br>
                IN HEALTHCARE ENTERPRISES<br>
                DEVELOPMENT<br>
                 CO. L.L.C
            </div>
            <br>
            <div class="account-detail-row">
                <span class="account-label">CURRENCY</span>
                <span class="account-value">USD</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">INTEREST RATE</span>
                <span class="account-value">0%</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT TYPE</span>
                <span class="account-value">CURRENT_ACCOUNT</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT NAME</span>
            </div>
            <div class="account-detail-row">
                CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES DEVELOPMENT CO. L.L.C
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT NUMBER</span>
                <span class="account-value">9830327120</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">ACCOUNT OPENED</span>
                <span class="account-value">08/09/2023</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">IBAN</span>
                <span class="account-value">AE440860000009830327120</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">OPENING BALANCE</span>
                <span class="account-value">0</span>
            </div>
            <div class="account-detail-row">
                <span class="account-label">CLOSING BALANCE</span>
                <span class="account-value">0</span>
            </div>
        </div>
        <div class="account-details-right">
            ACCOUNT STATEMENT<br>
            FROM 01/05/2025 TO 15/05/2025<br><br>
           CORAL WEALTH INVESTMENT <br> HEALTHCARE ENTERPRISES <br>
             DEVELOPMENT CO. L.L.C<br>
            IFZA, A2 Building, Dubai Digital Park, DSO
Office 606<br>
            Regal Tower,<br>
             Business Bay, Dubai, United Arab Emirates
        </div>
    </div>

    <div class="footer">
        <div class="digital-stamp">This is a digital stamp and<br>does not require signature.</div>
        
        <div class="copyright">© 2025 Coral Wealth Investment, Dubai</div>
        <div class="terms">Coral Wealth Standard Terms and Conditions are applicable</div>
        
        <div class="arabic-text">
            كورال ويلث إنفستمنت، دبي<br>
تنطبق الشروط والأحكام القياسية لشركة كورال ويلث
        </div>
        
        <div class="notice">
            Please review this account statement and report any discrepancies within 30 days.<br>
            If no issues are reported, the statement will be considered correct (subject to the Bank's right to correct errors).<br>
            For assistance, contact Coral wealth customer service at 600 500 946.
        </div>
        
        <div class="arabic-text">
    يرجى مراجعة كشف الحساب هذا والإبلاغ عن أي اختلافات في غضون 30 يوماً. في حال لم يتم الإبلاغ عن أي مشاكل، فسيتم اعتبار البيان صحيحاً (خاضع لحق شركة كورال ويلث في تصحيح الأخطاء).<br>
    للمساعدة، تواصل مع خدمة عملاء كورال ويلث على 946 500 600
</div>
        
        <div class="page-number">Page 3 of 3</div>
    </div>
</div>

</body>
</html>`
console.log(html)
            return res.send({
                result: true,

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