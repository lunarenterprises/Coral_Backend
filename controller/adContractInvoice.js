var model = require("../model/adContractInvoice");
var formidable = require("formidable");
var fs = require("fs");
let notification = require('../util/saveNotification')
var moment = require('moment')
var nodemailer = require('nodemailer')


module.exports.ContractInvoice = async (req, res) => {
    try {
        var form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }

            let user_id = req.user.admin_id
            let admin_role = req.user.role

            var adminData = await model.getAdmin(user_id, admin_role)
            if (admin_role == 'user') {
                return res.send({
                    result: false,
                    message: "Access Denied,try with authorized account"
                })
            }
            let date = moment().format('YYYY-MM-DD')
            let { contract_id } = fields
            if (!contract_id) {
                return res.send({
                    result: false,
                    message: "contract id is required"
                })
            }
            let checkcontact = await model.CheckContract(contract_id)
            let u_id = checkcontact[0]?.ui_u_id
            let checkuser = await model.CheckUser(u_id)
            if (checkuser.length > 0) {
                let checkinvoice = await model.CheckInvoice()

                if (checkinvoice.length > 0) {
                    const lastInvoiceNumber = checkinvoice[0]?.cni_invoice_id
                    var newInvoiceId = generateInvoiceId(lastInvoiceNumber);

                } else {
                    var newInvoiceId = 'INV-000001';

                }


                if (files.image) {
                    var oldPath = files.image.filepath;
                    var newPath =
                        process.cwd() +
                        "/uploads/invoice/" +
                        files.image.originalFilename;
                    let rawData = fs.readFileSync(oldPath);
                    fs.writeFile(newPath, rawData, async function (err) {
                        if (err) console.log(err);
                        let filepathh =
                            "/uploads/invoice/" + files.image.originalFilename;
                        let AddContractInvoice = await model.AddContractInvoiceQuery(newInvoiceId, contract_id, filepathh)
                        await notification.addNotification(user_id, admin_role, `Contract Invoice uploaded`, `Invoice uploaded for contract [${contract_id}] `)

                    })

                    let transporter = nodemailer.createTransport({
                        host: "smtp.hostinger.com",
                        port: 587,
                        auth: {
                            type: 'custom',
                            method: 'PLAIN',
                            user: 'nocontact@lunarenp.com',
                            pass: 'Cwicoral@123',
                        },
                    });

                    let data = [{
                        email: checkuser[0]?.u_email,
                        subject: "MESSAGE FROM CORAL WEALTH",
                        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice for Contract</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: auto;
      padding: 20px;
      border: 1px solid #eee;
      background-color: #f9f9f9;
    }
    .header {
      background-color: #007BFF;
      color: white;
      padding: 10px;
      text-align: center;
    }
    .invoice-details {
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Invoice</h2>
    </div>

    <p>Dear ${checkuser[0]?.u_name},</p>

    <p>Thank you for your continued partnership. Please find below the invoice for your contract.</p>

    <p><strong>Invoice Number:</strong> ${newInvoiceId}</p>
    <p><strong>Due Date:</strong> ${date}</p>

    <p><strong>Note:</strong> You can find the invoice attached to this email.</p>

    <p>If you have any questions regarding this invoice, feel free to contact us.</p>

    <p>Best regards,<br>Coral Wealth Team</p>

    <div class="footer">
      © 2025 Coral Wealth. All rights reserved.
    </div>
  </div>
</body>
</html>
`
                    }]


                    data.forEach(async (el) => {
                        let infos = await transporter.sendMail({
                            from: "CORAL WEALTH <nocontact@lunarenp.com>",
                            to: el.email,
                            subject: el.subject,
                            html: el.html,
                            attachments: [
                                {
                                    filename: files.image.originalFilename,
                                    path: newPath, // Full system path where the file was saved
                                    contentType: files.image.mimetype
                                }
                            ]
                        });
                        nodemailer.getTestMessageUrl(infos);

                    });


                    return res.send({
                        result: true,
                        message: "Contract Invoice uploaded successfully"
                    });

                } else {
                    return res.send({
                        result: true,
                        message: "Please upload contract invoice"
                    })

                }
            } else {
                return res.send({
                    result: false,
                    message: "contract invester user not found"
                })
            }
        })

    } catch (error) {
        console.log(error);
        return res.send({
            result: false,
            message: error.message,
        });
    }

}

function generateInvoiceId(lastNumber) {
    let numericPart = 0;

    if (lastNumber) {
        // Extract numeric part from something like "INV-000010"
        numericPart = parseInt(lastNumber.replace('INV-', ''), 10);
    }

    const nextNumber = numericPart + 1;
    const paddedNumber = String(nextNumber).padStart(6, '0');
    return `INV-${paddedNumber}`;
}
