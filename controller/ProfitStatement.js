var model = require('../model/profitStatement')
const fs = require('fs')
const path = require('path');
const exceljs = require('exceljs');
const moment = require('moment')
const { createPdfWithPuppeteer } = require('../util/pdfGeneration');

const uploadRoot = '/mnt/ebs500/uploads';

module.exports.downloadStatementExcel = async (req, res) => {
    try {
        let { user_id } = req.user
        if (!user_id) {
            return res.send({
                result: false,
                message: "user id is required"
            })
        }
        let { monthsAgo } = req.query
        let data = await model.getProfitStatement(user_id, monthsAgo)
        if (!data.length) {
            return res.send({
                result: false,
                message: "No data found"
            });
        }

        const user = await getUser(user_id);
        const username = user[0]?.u_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'user';

        const timestamp = Date.now();
        const filename = `profit_statement_${username}_${timestamp}.xlsx`;
        const relativePath = `statements/${filename}`;
        const outputFilePath = path.join(uploadRoot, relativePath);

        // Ensure directory exists
        const dirPath = path.dirname(outputFilePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet(`Profit Statement`);

        // Title Row
        const headingRow1 = worksheet.addRow(['Profit Statement']);
        worksheet.mergeCells('A1:J1');
        headingRow1.getCell(1).font = { bold: true, size: 16, name: 'Liberation Serif' };
        headingRow1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

        // Column Headers
        const headingRow2 = worksheet.addRow([
            "SL NO.",
            "INVESTED DATE",
            "INVESTED DURATION",
            "INVESTED AMOUNT",
            "INVESTED PERCENTAGE",
            "INVESTED RETURN",
            "INVESTED TYPE",
            "INVESTED STATUS",
            "INVESTED SECURITY",
            "INVESTED PROJECT"
        ]);
        headingRow2.eachCell(cell => {
            cell.font = { bold: true, size: 12 };
            cell.alignment = { horizontal: 'center' };
        });

        worksheet.columns = [
            { key: 'sl_no', width: 7 },
            { key: 'ui_date', width: 21 },
            { key: 'ui_duration', width: 18 },
            { key: 'ui_amount', width: 24 },
            { key: 'ui_percentage', width: 24 },
            { key: 'ui_return', width: 13 },
            { key: 'ui_type', width: 13 },
            { key: 'ui_status', width: 13 },
            { key: 'ui_security_option', width: 18 },
            { key: 'ui_project_name', width: 18 },
        ];

        // Data Rows
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

        // Save file
        await workbook.xlsx.writeFile(outputFilePath);

        return res.send({
            result: true,
            message: "Data retrieved",
            file: `${req.protocol}://${req.get("host")}/uploads/${relativePath}`
        });
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })

    }
}


module.exports.downloadStatementPdf = async (req, res) => {
    try {
        let { user_id } = req.user
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
            const dirname = '/mnt/ebs500/uploads/statements';
            const timestamp = Date.now();
            const outputFilePath = path.join(dirname, `profit_statement_user_${user[0].u_name}_${timestamp}.pdf`);

            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname, { recursive: true });
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
            Please review this account statement and report any discrepancies within 30 days.<br>
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

<!-- Page 2: AED Account Statement -->
<div class="page">
    <div class="company-info">
        <span>CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C</span>
        IFZA, A2 Building, Dubai Digital Park, DSO Office 606<br>
        Regal Tower, Business Bay,<br>
        Dubai, United Arab Emirates
    </div>

    <div class="statement-header">
        ACCOUNT STATEMENT<br>
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
            Please review this account statement and report any discrepancies within 30 days.<br>
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
            return res.send({
                result: true,
                message: "Pdf generated successfully",
                file: req.protocol + "://" + req.get("host") + outputFilePath.replace('/mnt/ebs500', '')
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