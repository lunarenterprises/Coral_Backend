var model = require('../model/addinvoicefile')
var moment = require('moment')
var fs = require('fs')
var formidable = require('formidable')
var nodemailer = require('nodemailer')
var path = require('path')

module.exports.AddInvoiceFile = async (req, res) => {
    try {
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
        var date = moment().format('DD_MM_YYYY')
        var form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }
            var c_id = fields.c_id
            let investdetails = await model.getInvest(c_id)
            if (investdetails.length > 0) {
                var username = investdetails[0]?.u_name.toUpperCase().substring(0, 3)
                if (files.invoice) {
                    var oldPath = files.invoice.filepath
                    var newPath =
                        process.cwd() + "/uploads/invoice/" + 'INV' + '_' + username + '_' + date + '.' + files.invoice.mimetype.replace('application/', '')
                    let rawData = fs.readFileSync(oldPath);
                    fs.writeFile(newPath, rawData, async function (err) {
                        if (err) console.log(err);
                        let filepathh = "wealth/uploads/invoice/" + 'INV' + '_' + username + '_' + date + '.' + files.invoice.mimetype.replace('application/', '')
                        let addproductss = await model.Updateinvest(filepathh, c_id)
                        if (addproductss.affectedRows > 0) {


                            let info = await transporter.sendMail({
                                from: "CORAL WEALTH <nocontact@lunarenp.com>",
                                to: 'operations@coraluae.com',
                                subject: 'Contract and Invoice Attached',
                                text: `Hello Operations Team,
Please find the attached contract and invoice.
                                
Client Details:
- Name: ${investdetails[0]?.u_name}
- Phone: ${investdetails[0]?.u_mobile}
- Email: ${investdetails[0]?.u_email}

                                `,
                                attachments: [
                                    {
                                        filename: 'CON' + '_' + username + '_' + date + '.pdf', // Name of the contract file
                                        path: process.cwd() + '/' + investdetails[0]?.ui_contract_file.replace('wealth/', '') // Path to the contract file
                                    },
                                    {
                                        filename: 'INV' + '_' + username + '_' + date + '.' + files.invoice.mimetype.replace('application/', ''), // Name of the invoice file
                                        path: process.cwd() + "/uploads/invoice/" + 'INV' + '_' + username + '_' + date + '.' + files.invoice.mimetype.replace('application/', '') // Path to the invoice file
                                    }
                                ]
                            });

                            let infos = await transporter.sendMail({
                                from: 'CORAL WEALTH <nocontact@lunarenp.com>', // Sender email
                                to: `${investdetails[0]?.u_email}`, // Client email
                                subject: 'Verification in Process',
                                text: `Hello ${investdetails[0]?.u_name},\n\nYour verification is currently being processed. After 24 hours, you will be able to track your growth using our platform.\n\nIf you have any questions, feel free to contact us.\n\nBest regards,\n Coral Wealth`
                            });

                            return res.send({
                                result: true,
                                message: "invoice added successfully"
                            })
                        } else {
                            return res.send({
                                result: false,
                                message: "failed to add invoice"
                            })
                        }
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "file empty,upload file to continue"
                    })
                }
            } else {
                return res.send({
                    result: false,
                    message: "invest id not found"
                })
            }



        })


    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}