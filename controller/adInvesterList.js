var model = require('../model/adInvesterList')
var userModel = require('../model/users')
var moment = require('moment')
var fs = require("fs");
const path = require('path')
var pdfdownload = require('../util/pdfGeneration')

module.exports.InvestersList = async (req, res) => {
    try {
        var { user_id, user_name, user_number, request, format } = req.body

        let admin_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(admin_id, admin_role)

        if (adminData[0]?.ad_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        var condition = ''
        var con = ''
        if (user_id) {
            condition = `and ui.ui_u_id ='${user_id}'`
            con = `and us.u_id ='${user_id}' `
        }
        if (user_name) {
            condition = ` and (us.u_name like '%${user_name}%')`
        }
        if (user_number) {
            condition = ` and (us.u_mobile like '%${user_number}%')`
        }
        if (user_name && user_number) {
            condition = ` and (us.u_name like '%${user_name}%' or us.u_mobile like '%${user_number}%')`
        }

        var investersData = await model.GetInvester(condition)

        var investRequest = await model.GetInvestRequest(condition)

        var allusersData = await model.GetSAllUsers(con)


        if (investersData.length > 0 || allusersData.length > 0) {


            let serverName = req.protocol + "://" + req.get("host");
            var today = moment().format('MMM_DD_YYYY_hh_mm')

            if (format == 'pdf') {
                const pdfDir = '/mnt/ebs500/uploads/contractspdf';
                const filename = `coral_${today}.pdf`;
                const fullPath = path.join(pdfDir, filename); // Absolute EBS file path

                // Ensure the directory exists
                if (!fs.existsSync(pdfDir)) {
                    fs.mkdirSync(pdfDir, { recursive: true });
                }

                let datahtml = '';
                for (let data of investersData) {
                    let transferusername = '-';
                    if (data.ui_transfer) {
                        const userdata = await userModel.getUser(data.ui_transfer);
                        if (userdata.length > 0) {
                            transferusername = userdata[0]?.u_name || '-';
                        }
                    }

                    datahtml += `
                        <tr>
                            <td>${data.u_id}</td>
                            <td>${data.u_name}</td>
                            <td>${data.ui_id}</td>
                            <td>${moment(data.u_joining_date).format('YYYY-MM-DD')}</td>
                            <td>${transferusername}</td>
                            <td>${data.n_name}</td>
                            <td>${data.ui_type}</td>
                            <td>${data.ui_status}</td>
                        </tr>
                    `;
                }

                const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <title>CORAL CONTRACT LIST</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; background: #f4f4f4; margin: 0; padding: 0; }
                .container { width: 90%; margin: 10px auto; background: #fff; padding: 10px; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
                h1 { text-align: center; font-size: 16px; color: #333; }
                .table-container { overflow-x: auto; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 10px; }
                th, td { border: 1px solid #ddd; padding: 3px; text-align: left; }
                th { background: #333; color: #fff; }
                tr:nth-child(even) { background: #f2f2f2; }
                tr:hover { background: #ddd; }
            </style>
            </head>
            <body>
            <div class="container">
                <h1>Contract List</h1>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>User Name</th>
                                <th>Contract ID</th>
                                <th>Join Date</th>
                                <th>Transfer</th>
                                <th>Nominee Name</th>
                                <th>Contract Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${datahtml}
                        </tbody>
                    </table>
                </div>
            </div>
            </body>
            </html>`;

                const pdf = await pdfdownload.createPdfWithPuppeteer(html, fullPath); // Save to EBS

                return res.send({
                    result: true,
                    message: "Data retrieved",
                    pdf: `${serverName}/uploads/contractspdf/${filename}` // Public URL served via Express
                });
            }

            // Default JSON response
            return res.send({
                result: true,
                message: "data retrieved successfully",
                investerusers: allusersData,
                data: investersData,
                investRequest: investRequest
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