var model = require('../model/withdrawhistory')
var moment = require('moment')
const exceljs = require('exceljs');
var fs = require("fs");

module.exports.WithdrawHistory = async (req, res) => {
    try {
        let { user_id } = req.headers
        let { format } = req.body
        var today = moment().format('MMM_DD_YYYY_hh_mm_ss')
        let users = await model.getUsers(user_id)
        let withdrawhistory = await model.getWithdraw(user_id)
        let investhistory = await model.getInvested(user_id)
        if (format == 'excel') {
            let workbook = new exceljs.Workbook();
            let worksheet = workbook.addWorksheet(`HISTORY_${today}`)
            let path1 = `/mnt/ebs500/uploads/history`;
            let path = `${path1}/history_${today}.xlsx`;

            if (!fs.existsSync(path1)) {
                fs.mkdirSync(path1, true);
            }

            let headingRow1 = worksheet.addRow(["Withdraw Request"]);
            worksheet.mergeCells(`A1:F1`);
            headingRow1.getCell(1).font = { bold: true, size: 16, name: 'Liberation Serif' };
            headingRow1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            let headingRow2 = worksheet.addRow(["SL NO.", "BANK NAME", "BRANCH NAME", "ACCOUNT NO.", "IFSC CODE/IBAN/ROUTING", "SWIFT CODE", "CURRENCY", "AMOUNT", "DATE"]);
            headingRow2.getCell(1).font = { bold: true, size: 14, name: 'Liberation Serif' };
            headingRow2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.addRow([]);

            worksheet.columns = [
                { key: 'sl_no', width: 7 },
                { key: 'bank_name', width: 21 },
                { key: 'branch_name', width: 18 },
                { key: 'account_no', width: 24 },
                { key: 'ifsc_code', width: 24 },
                { key: 'swift_code', width: 13 },
                { key: 'currency', width: 13 },
                { key: 'amount', width: 13 },
                { key: 'date', width: 13 },

            ];

            worksheet.getRow(2).eachCell((cell) => {
                cell.font = { bold: true, size: 10, name: 'Liberation Serif' };
            });

            withdrawhistory.forEach((el, index) => {
                worksheet.addRow([
                    index + 1,
                    el.b_name,
                    el.b_branch,
                    el.b_account_no,
                    el.b_ifsc_code,
                    el.b_swift_code,
                    el.b_currency,
                    el.wr_amount,
                    moment(el.wr_date).format("YYYY-MM-DD")

                ]);

            });

            worksheet.addRow([]);
            let headingRow3 = worksheet.addRow(["Investment"]);
            worksheet.mergeCells(`A14:F14`);
            headingRow3.getCell(1).font = { bold: true, size: 16, name: 'Liberation Serif' };
            headingRow3.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            let headingRow4 = worksheet.addRow(["SL NO.", "PROJECT NAME", "INDUSTRY", "DURATION", "AMOUNT", "DATE"]);
            headingRow4.getCell(1).font = { bold: false, size: 11, name: 'Calibri' };
            headingRow4.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.addRow([]);

            // worksheet.columns = [
            //     { key: 'sl_no', width: 7 },
            //     { key: 'project_name', width: 21 },
            //     { key: 'industry', width: 18 },
            //     { key: 'duration', width: 24 },
            //     { key: 'amount', width: 13 },
            //     { key: 'date', width: 13 },

            // ];

            worksheet.getRow(2).eachCell((cell) => {
                cell.font = { bold: true, size: 10, name: 'Liberation Serif' };
            });

            investhistory.forEach((el, index) => {
                worksheet.addRow([
                    index + 1,
                    el.ui_project_name,
                    el.ui_industry,
                    el.ui_duration,
                    el.ui_amount,
                    moment(el.ui_date).format("YYYY-MM-DD")

                ]);

            });
            await workbook.xlsx.writeFile(path);

        }
        return res.send({
            result: true,
            message: "data retrieved",
            total_amount: users[0]?.u_wallet,
            file: format ? req.protocol + "://" + req.get("host") + path.replace('/mnt/ebs500', '') : '',
            withdrawhistory: withdrawhistory,
            investhistory: investhistory
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

