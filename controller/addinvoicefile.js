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
                    const oldPath = files.invoice.filepath;
                    const mimeExt = files.invoice.mimetype.replace('application/', '');
                    const filename = `INV_${username}_${date}.${mimeExt}`;

                    const invoiceDir = '/mnt/ebs500/uploads/invoice';
                    const newPath = path.join(invoiceDir, filename);

                    // Ensure directory exists
                    if (!fs.existsSync(invoiceDir)) {
                        fs.mkdirSync(invoiceDir, { recursive: true });
                    }

                    const rawData = fs.readFileSync(oldPath);
                    fs.writeFile(newPath, rawData, async function (err) {
                        if (err) {
                            console.error('Error saving invoice:', err);
                            return res.send({
                                result: false,
                                message: "Error saving invoice file"
                            });
                        }

                        const filepathh = `uploads/invoice/${filename}`; // Relative path for DB

                        let addproductss = await model.Updateinvest(filepathh, c_id);
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
                                        filename: `CON_${username}_${date}.pdf`,
                                        path: path.join('/mnt/ebs500/', investdetails[0]?.ui_contract_file.replace('wealth/', ''))
                                    },
                                    {
                                        filename: filename,
                                        path: newPath
                                    }
                                ]
                            });

                            await transporter.sendMail({
                                from: 'CORAL WEALTH <nocontact@lunarenp.com>',
                                to: `${investdetails[0]?.u_email}`,
                                subject: 'Verification in Process',
                                text: `Hello ${investdetails[0]?.u_name},\n\nYour verification is currently being processed. After 24 hours, you will be able to track your growth using our platform.\n\nIf you have any questions, feel free to contact us.\n\nBest regards,\nCoral Wealth`
                            });

                            return res.send({
                                result: true,
                                message: "Invoice added successfully"
                            });
                        } else {
                            return res.send({
                                result: false,
                                message: "Failed to update invoice"
                            });
                        }
                    });
                } else {
                    return res.send({
                        result: false,
                        message: "File empty, upload file to continue"
                    });
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