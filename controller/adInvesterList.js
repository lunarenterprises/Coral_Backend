var model = require('../model/adInvesterList')
var userModel = require('../model/users')
var moment = require('moment')
var fs = require("fs");
var pdfdownload = require('../util/pdfGeneration')

module.exports.InvestersList = async (req, res) => {
    try {
        var { user_id, user_name, user_number, format } = req.body

        let admin_id = req.user.admin_id
        let admin_role = req.user.role

        var adminData = await model.getAdmin(admin_id, admin_role)

        if (adminData[0]?.u_role == 'user') {
            return res.send({
                result: false,
                message: "Access Denied,try with authorized account"
            })
        }

        var condition = ''
        if (user_id) {
            condition = `and ui.ui_u_id ='${user_id}'`
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

        var investeruserData = await model.GetInvesterUser(condition)

        var allusersData = await model.GetSAllUsers()


        if (investersData.length > 0) {


            let serverName = req.protocol + "://" + req.get("host");
            var today = moment().format('MMM_DD_YYYY_hh_mm')

            if (format == 'pdf') {
                var path1 = `${process.cwd()}/uploads/contractspdf`;
                var path = `${process.cwd()}/uploads/contractspdf/coral_${today}.pdf`;
                if (!fs.existsSync(path1)) {
                    fs.mkdirSync(path1, true);
                }
                var datahtml = ''
                for (let data of investersData) {
                    var trasferusername = '-';
                    if (data.ui_transfer) {
                        var userdata = await userModel.getUser(data.ui_transfer);
                        if (userdata.length > 0) {
                            trasferusername = userdata[0]?.u_name || '-';
                        }
                    }

                    datahtml += '<tr>' +
                        '<td>' + data.u_id + '</td>' +
                        '<td>' + data.u_name + '</td>' +
                        '<td>' + data.ui_id + '</td>' +
                        '<td>' + moment(data.u_joining_date).format('YYYY-MM-DD') + '</td>' +
                        '<td>' + trasferusername + '</td>' +
                        '<td>' + data.n_name + '</td>' +
                        '<td>' + data.ui_type + '</td>' +
                        '<td>' + data.ui_status + '</td>' +
                        '</tr>'
                }
                console.log(datahtml, "html");

                let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CORAL CONTRACT LIST</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            font-size: 12px; /* Reduced font size for the body */
        }
        .container {
            width: 90%;
            margin: 10px auto;
            background-color: white;
            padding: 10px;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
            color: #333;
            font-size: 16px; /* Reduced font size for the header */
        }
        .table-container {
            overflow-x: auto;
            margin-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table, th, td {
            border: 1px solid #ddd;
            text-align: left;
            font-size: 10px;
            padding: 3px;
        }
        th {
            background-color: #333;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #ddd;
        }
        .status {
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 5px;
            text-align: center;
        }
        .pending {
            color: white;
            background-color: orange;
        }
        .paid {
            color: white;
            background-color: green;
        }
        .delivered {
            color: white;
            background-color: green;
        }
        .not-delivered {
            color: white;
            background-color: orange;
        }

    </style>
</head>
<body>

<div class="container">
    <h1>Contract List</h1>
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th> User ID</th>
                    <th> User Name</th>
                    <th> Contract Id</th>
                    <th> Join Date</th>
                    <th> Trasfer</th>
                    <th> Nomine Name </th>
                    <th> Contract Type</th>
                    <th> Status</th>

                </tr>
            </thead>
            <tbody>
                ${datahtml}
            </tbody>
        </table>
    </div>
</div>

</body>
</html> `
                var pdf = await pdfdownload.createPdfWithPuppeteer(html, path);

                return res.send({
                    result: true,
                    message: "data retrieved",
                    pdf: `${serverName}/uploads/contractspdf/coral_${today}.pdf`
                })

            }

            return res.send({
                result: true,
                message: "data retrieved successfully",
                investerusers: allusersData,
                data: investersData,
                users: allusersData
            })
        } else {
            return res.send({
                result: false,
                message: "failed to get data"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}