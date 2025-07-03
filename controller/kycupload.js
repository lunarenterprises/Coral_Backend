// var model = require('../model/kycupload')
// var formidable = require('formidable')
// var moment = require('moment')
// var fs = require('fs')
// var nodemailer = require('nodemailer')
// let notifiaction = require('../util/saveNotification')
// let { sendNotificationToAdmins } = require('../util/firebaseConfig')
// let { saveFile } = require('../util/uploadFile')

// module.exports.KycUpload = async (req, res) => {
//     try {
//         let transporter = nodemailer.createTransport({
//             host: "smtp.hostinger.com",
//             port: 587,
//             auth: {
//                 type: 'custom',
//                 method: 'PLAIN',
//                 user: 'nocontact@lunarenp.com',
//                 pass: 'Cwicoral@123',
//             },
//         });
//         var date = moment().format('YYYY_MM_DD')
//         let { user_id } = req.headers
//         if (!user_id) {
//             return res.send({
//                 result: false,
//                 message: "User id is required"
//             })
//         }
//         console.log("date : ", date)
//         var form = new formidable.IncomingForm({ multiples: true });
//         form.parse(req, async function (err, fields, files) {
//             if (err) {
//                 return res.send({
//                     result: false,
//                     message: "File Upload Failed!",
//                     data: err,
//                 });
//             }
//             let { name_per_bank, account_no, ifsc_code, swift_code, bank_name, branch_name, currency, verification_type, id_type, wfa_password, dob, country } = fields
//             if (!name_per_bank || !account_no || !ifsc_code || !bank_name || !branch_name || !currency || !verification_type || !id_type || !wfa_password || !dob || !country) {
//                 return res.send({
//                     result: false,
//                     message: "All fields are required"
//                 })

//             }
//             console.log("fields : ", fields)
//             let finduser = await model.GetUser(user_id)
//             if (finduser[0]?.u_kyc && (finduser[0]?.u_kyc === "active" || finduser[0]?.u_kyc === "pending")) {
//                 return res.send({
//                     result: false,
//                     message: "Kyc already submitted"
//                 })
//             }
//             console.log("finduser : ", finduser)
//             if (verification_type == "photo") {
//                 if (files.front_page && files.back_page && files.image && files.bank_file) {
//                     const datePrefix = Date.now(); // Or use your own formatted date

//                     const front_page = saveFile(
//                         files.front_page.filepath,
//                         'kyc',
//                         `${datePrefix}_${files.front_page.originalFilename.replace(/ /g, '_')}`
//                     );

//                     const back_page = saveFile(
//                         files.back_page.filepath,
//                         'kyc',
//                         `${datePrefix}_${files.back_page.originalFilename.replace(/ /g, '_')}`
//                     );

//                     const profile = saveFile(
//                         files.image.filepath,
//                         'profile',
//                         `${datePrefix}_${files.image.originalFilename.replace(/ /g, '_')}`
//                     );

//                     const bank_file = saveFile(
//                         files.bank_file.filepath,
//                         'bank_statements',
//                         `${datePrefix}_${files.bank_file.originalFilename.replace(/ /g, '_')}`
//                     );

//                     console.log("front_page : ", front_page)
//                     console.log("back_page : ", back_page)
//                     console.log("profile : ", profile)
//                     console.log("bank_file : ", bank_file)

//                     let updateuser = await model.UpdateUser(profile, wfa_password, user_id, dob)
//                     console.log("updateuser : ", updateuser)
//                     let insertbank = await model.Addbank(name_per_bank, account_no, ifsc_code, swift_code, bank_name, branch_name, currency, user_id)
//                     console.log("user kyc ", user_id, id_type, front_page, back_page, bank_file)
//                     let insertdata = await model.AddUserKyc(user_id, id_type, front_page, back_page, bank_file)
//                     console.log("insertdata", insertdata)
//                     if (insertdata.affectedRows > 0) {
//                         var username = finduser[0]?.u_name.toUpperCase().substring(0, 3)
//                         let info = await transporter.sendMail({
//                             from: "CORAL WEALTH <nocontact@lunarenp.com>",
//                             // to: 'operations@coraluae.com',
//                             to: 'aishwaryalunar@gmail.com',
//                             subject: 'KYC VERIFICATION REQUEST',
//                             html: `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>KYC Verification</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f9f9f9;
//             margin: 0;
//             padding: 0;
//         }
//         .container {
//             width: 100%;
//             max-width: 600px;
//             margin: 20px auto;
//             background-color: #ffffff;
//             border: 1px solid #dddddd;
//             border-radius: 8px;
//             box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//             padding: 20px;
//         }
//         .header {
//             text-align: center;
//             border-bottom: 2px solid #4CAF50;
//             margin-bottom: 20px;
//             padding-bottom: 10px;
//         }
//         .header h1 {
//             color: #4CAF50;
//             margin: 0;
//         }
//         .content {
//             line-height: 1.6;
//             color: #333333;
//         }
//         .footer {
//             text-align: center;
//             margin-top: 20px;
//             font-size: 12px;
//             color: #777777;
//         }
//         .bank-details {
//             background-color: #f4f4f4;
//             padding: 10px;
//             border: 1px solid #dddddd;
//             border-radius: 5px;
//             margin-bottom: 20px;
//         }
//         .bank-details h3 {
//             margin-top: 0;
//             color: #4CAF50;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <h1>KYC Verification Request</h1>
//         </div>
//         <div class="content">
//             <p>Hello Operations Team,</p>
//             <p>We have received a KYC verification request from the client. Please find the client details below:</p>
//             <ul>
//                 <li><strong>Name:</strong> ${finduser[0]?.u_name}</li>
//                 <li><strong>Email:</strong> ${finduser[0]?.u_email}</li>
//                 <li><strong>Phone:</strong> ${finduser[0]?.u_mobile}</li>
//                  <li><strong>DOB:</strong> ${dob}</li>
//             </ul>
//             <div class="bank-details">
//                 <h3>Bank Details</h3>
//                 <ul>
//                     <li><strong>Name As Per Bank Account:</strong> ${name_per_bank}</li>
//                     <li><strong>Bank Name:</strong> ${bank_name}</li>
//                     <li><strong>Branch Name:</strong> ${branch_name}</li>
//                     <li><strong>Account Number:</strong> ${account_no}</li>
//                     <li><strong>IFSC Code:</strong> ${ifsc_code}</li>
//                     <li><strong>Swift Code:</strong> ${swift_code}</li>
//                     <li><strong>Currency:</strong> ${currency}</li>
//                 </ul>
//             </div>
//             <p>Attached, you will find the relevant documents for your review and processing.</p>
//             <p>Please complete the verification process at the earliest.</p>
//         </div>

//     </div>
// </body>
// </html>
// `,
//                             attachments: [
//                                 {
//                                     filename: 'KYC' + '_FRONT_PAGE_' + username + '_' + date + '.pdf',
//                                     path: process.cwd() + "/uploads/kyc/" + date + '_' + files.back_page.originalFilename.replace(' ', '_')
//                                 },
//                                 {
//                                     filename: 'KYC' + '_BACK_PAGE_' + username + '_' + date + '.pdf',
//                                     path: process.cwd() + "/uploads/kyc/" + date + '_' + files.back_page.originalFilename.replace(' ', '_')
//                                 },
//                                 {
//                                     filename: 'PROFILE' + username + '_' + date + '.' + files.image.originalFilename.split('.')[1],
//                                     path: process.cwd() + "/uploads/profile/" + date + '_' + files.image.originalFilename.replace(' ', '_')
//                                 },
//                                 {
//                                     filename: 'BANK' + '_STATEMENT_' + username + '_' + date + '.pdf',
//                                     path: process.cwd() + "/uploads/bank_statements/" + date + '_' + files.bank_file.originalFilename.replace(' ', '_')
//                                 }
//                             ]
//                         });
//                         console.log('Email sent to OperationTeam:', info.messageId);
//                         await model.UpdateUserKyc(user_id, country, currency)
//                         await notifiaction.addNotification(user_id,
//                             finduser[0]?.u_role,
//                             "KYC Verification Request",
//                             "Your KYC verification request has been submitted successfully"
//                         )
//                         await sendNotificationToAdmins("KYC submitted", `${username} has submitted the KYC.`)
//                         return res.send({
//                             result: true,
//                             message: "Kyc submitted successfully,one of our representative will contact u"
//                         })

//                     } else {
//                         return res.send({
//                             result: false,
//                             message: "Failed to upload kyc document,pls try again"
//                         })
//                     }

//                 } else {
//                     if (!files.front_page) {
//                         return res.send({
//                             result: false,
//                             message: "please upload front page of your id"
//                         })
//                     }
//                     if (!files.back_page) {
//                         return res.send({
//                             result: false,
//                             message: "please upload back page of your id"
//                         })
//                     }
//                     if (!files.bank_file) {
//                         return res.send({
//                             result: false,
//                             message: "please upload bank statement"
//                         })
//                     }
//                     if (!files.image) {
//                         return res.send({
//                             result: false,
//                             message: "please upload your profile picture"
//                         })
//                     }
//                 }
//             } else if (verification_type == 'video') {
//                 return res.send({
//                     result: false,
//                     message: "Video verification is not available"
//                 })
//             } else {
//                 return res.send({
//                     result: false,
//                     message: "Invalid verification type"
//                 })
//             }

//         })
//     } catch (error) {
//         return res.send({
//             result: false,
//             message: error.message
//         })
//     }
// }


// module.exports.KycReUpload = async (req, res) => {
//     try {
//         let transporter = nodemailer.createTransport({
//             host: "smtp.hostinger.com",
//             port: 587,
//             auth: {
//                 type: 'custom',
//                 method: 'PLAIN',
//                 user: 'nocontact@lunarenp.com',
//                 pass: 'Cwicoral@123',
//             },
//         });
//         var date = moment().format('YYYY_MM_DD')
//         let { user_id } = req.headers
//         if (!user_id) {
//             return res.send({
//                 result: false,
//                 message: "User id is required"
//             })
//         }
//         let bankData = await model.GetBank(user_id)

//         var form = new formidable.IncomingForm({ multiples: true });
//         form.parse(req, async function (err, fields, files) {
//             if (err) {
//                 return res.send({
//                     result: false,
//                     message: "File Upload Failed!",
//                     data: err,
//                 });
//             }
//             let { kyc_id } = fields
//             if (!kyc_id) {
//                 return res.send({
//                     result: false,
//                     message: "Kyc id is required"
//                 })
//             }
//             let checkKyc = await model.CheckKyc(user_id, kyc_id)
//             if (checkKyc.length == 0) {
//                 return res.send({
//                     result: false,
//                     message: "Kyc not found"
//                 })
//             }
//             let finduser = await model.GetUser(user_id)
//             if (finduser[0]?.u_kyc && (finduser[0]?.u_kyc === "active" || finduser[0]?.u_kyc === "pending")) {
//                 return res.send({
//                     result: false,
//                     message: "Kyc already submitted"
//                 })
//             }
//             let front_page = null
//             let back_page = null
//             let bank_file = null
//             if (files.front_page) {
//                 var oldPath1 = files.front_page.filepath
//                 var newPath1 =
//                     process.cwd() + "/uploads/kyc/" + date + '_' + files.front_page.originalFilename.replace(' ', '_')
//                 let rawData1 = fs.readFileSync(oldPath1);
//                 fs.writeFileSync(newPath1, rawData1)
//                 front_page = "/uploads/kyc/" + date + '_' + files.front_page.originalFilename.replace(' ', '_')
//             }
//             if (files.back_page) {
//                 var oldPath2 = files.back_page.filepath
//                 var newPath2 =
//                     process.cwd() + "/uploads/kyc/" + date + '_' + files.back_page.originalFilename.replace(' ', '_')
//                 let rawData2 = fs.readFileSync(oldPath2);
//                 fs.writeFileSync(newPath2, rawData2)
//                 back_page = "/uploads/kyc/" + date + '_' + files.back_page.originalFilename.replace(' ', '_')
//             }
//             if (files.bank_file) {
//                 var oldPath4 = files.bank_file.filepath
//                 var newPath4 =
//                     process.cwd() + "/uploads/bank_statements/" + date + '_' + files.bank_file.originalFilename.replace(' ', '_')
//                 let rawData4 = fs.readFileSync(oldPath4);
//                 fs.writeFileSync(newPath4, rawData4)
//                 bank_file = "/uploads/bank_statements/" + date + '_' + files.bank_file.originalFilename.replace(' ', '_')
//             }
//             if (front_page || back_page || bank_file) {

//                 let updateKyc = await model.UpdateKyc(kyc_id, front_page, back_page, bank_file)
//                 if (updateKyc.affectedRows > 0) {
//                     var username = finduser[0]?.u_name.toUpperCase().substring(0, 3)
//                     let info = await transporter.sendMail({
//                         from: "CORAL WEALTH <nocontact@lunarenp.com>",
//                         // to: 'operations@coraluae.com',
//                         to: 'aishwaryalunar@gmail.com',
//                         subject: 'KYC VERIFICATION REQUEST',
//                         html: `<!DOCTYPE html>
//                     <html lang="en">
//                     <head>
//                     <meta charset="UTF-8">
//                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                     <title> Resubmit KYC Verification</title>
//                     <style>
//                     body {
//                         font-family: Arial, sans-serif;
//             background-color: #f9f9f9;
//             margin: 0;
//             padding: 0;
//             }
//             .container {
//                 width: 100%;
//                 max-width: 600px;
//                 margin: 20px auto;
//                 background-color: #ffffff;
//                 border: 1px solid #dddddd;
//                 border-radius: 8px;
//                 box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//                 padding: 20px;
//                 }
//                 .header {
//                     text-align: center;
//                     border-bottom: 2px solid #4CAF50;
//                     margin-bottom: 20px;
//                     padding-bottom: 10px;
//                     }
//                     .header h1 {
//                         color: #4CAF50;
//                         margin: 0;
//                         }
//                         .content {
//                             line-height: 1.6;
//                             color: #333333;
//                             }
//                             .footer {
//                                 text-align: center;
//                                 margin-top: 20px;
//                                 font-size: 12px;
//                                 color: #777777;
//                                 }
//                                 .bank-details {
//                                     background-color: #f4f4f4;
//                                     padding: 10px;
//                                     border: 1px solid #dddddd;
//                                     border-radius: 5px;
//                                     margin-bottom: 20px;
//                                     }
//                                     .bank-details h3 {
//                                         margin-top: 0;
//                                         color: #4CAF50;
//                                         }
//                                         </style>
//                                         </head>
//                                         <body>
//                                         <div class="container">
//                                         <div class="header">
//                                         <h1>KYC Verification Request</h1>
//                                         </div>
//                                         <div class="content">
//                                         <p>Hello Operations Team,</p>
//                                         <p>We have received a KYC verification request from the client. Please find the client details below:</p>
//                                         <ul>
//                                         <li><strong>Name:</strong> ${finduser[0]?.u_name}</li>
//                                         <li><strong>Email:</strong> ${finduser[0]?.u_email}</li>
//                                         <li><strong>Phone:</strong> ${finduser[0]?.u_mobile}</li>
//                                         <li><strong>DOB:</strong> ${finduser[0]?.u_dob}</li>
//                                         </ul>
//                                         <div class="bank-details">
//                                         <h3>Bank Details</h3>
//                                         <ul>
//                                         <li><strong>Name As Per Bank Account:</strong> ${bankData[0]?.b_name_as}</li>
//                                         <li><strong>Bank Name:</strong> ${bankData[0]?.b_name}</li>
//                                         <li><strong>Branch Name:</strong> ${bankData[0]?.b_branck}</li>
//                                         <li><strong>Account Number:</strong> ${bankData[0]?.b_account_no}</li>
//                                         <li><strong>IFSC Code:</strong> ${bankData[0]?.b_ifsc_code}</li>
//                                         <li><strong>Swift Code:</strong> ${bankData[0]?.b_swift_code}</li>
//                                         <li><strong>Currency:</strong> ${bankData[0]?.b_currency}</li>
//                                         </ul>
//                                         </div>
//                                         <p>Attached, you will find the relevant documents for your review and processing.</p>
//                                         <p>Please complete the verification process at the earliest.</p>
//                                         </div>
//                                         </div>
//                                         </body>
// </html>
// `,
//                         attachments: [
//                             {
//                                 filename: 'KYC' + '_FRONT_PAGE_' + username + '_' + date + '.pdf',
//                                 path: process.cwd() + "/uploads/kyc/" + date + '_' + files.back_page.originalFilename.replace(' ', '_')
//                             },
//                             {
//                                 filename: 'KYC' + '_BACK_PAGE_' + username + '_' + date + '.pdf',
//                                 path: process.cwd() + "/uploads/kyc/" + date + '_' + files.back_page.originalFilename.replace(' ', '_')
//                             },
//                             {
//                                 filename: 'BANK' + '_STATEMENT_' + username + '_' + date + '.pdf',
//                                 path: process.cwd() + "/uploads/bank_statements/" + date + '_' + files.bank_file.originalFilename.replace(' ', '_')
//                             }
//                         ]
//                     });
//                     await notifiaction.addNotification(user_id,
//                         finduser[0]?.u_role,
//                         "KYC Verification Request",
//                         "Your KYC verification request has been submitted successfully"
//                     )
//                     await sendNotificationToAdmins("KYC reuploaded", `${username} has resubmitted the KYC.`)
//                     return res.send({
//                         result: true,
//                         message: "Kyc submitted successfully, one of our representative will contact u"
//                     })
//                 }
//             } else {
//                 return res.send({
//                     result: false,
//                     message: "Files not found"
//                 })
//             }
//         })
//     } catch (error) {
//         return res.send({
//             result: false,
//             message: error.message
//         })
//     }
// }

const model = require('../model/kycupload')
const formidable = require('formidable')
const moment = require('moment')
const fs = require('fs')
const nodemailer = require('nodemailer')
const notifiaction = require('../util/saveNotification')
const { sendNotificationToAdmins } = require('../util/firebaseConfig')
const { saveFile } = require('../util/uploadFile')

const uploadRoot = '/mnt/ebs500/uploads'; // Centralized upload root path

module.exports.KycUpload = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 587,
            auth: {
                type: 'custom',
                method: 'PLAIN',
                user: 'nocontact@lunarenp.com',
                pass: 'Cwicoral@123',
            },
        });

        const date = moment().format('YYYY_MM_DD')
        const { user_id } = req.headers

        if (!user_id) return res.send({ result: false, message: "User id is required" })

        const form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async (err, fields, files) => {
            if (err) return res.send({ result: false, message: "File Upload Failed!", data: err });

            const requiredFields = ['name_per_bank', 'account_no', 'ifsc_code', 'bank_name', 'branch_name', 'currency', 'verification_type', 'id_type', 'wfa_password', 'dob', 'country']
            for (const field of requiredFields) {
                if (!fields[field]) return res.send({ result: false, message: `Missing field: ${field}` })
            }

            const finduser = await model.GetUser(user_id)
            if (finduser[0]?.u_kyc === "active" || finduser[0]?.u_kyc === "pending")
                return res.send({ result: false, message: "Kyc already submitted" })

            if (fields.verification_type === "photo") {
                const requiredFiles = ['front_page', 'back_page', 'image', 'bank_file']
                for (const file of requiredFiles) {
                    if (!files[file]) return res.send({ result: false, message: `Please upload ${file.replace('_', ' ')}` })
                }

                const datePrefix = Date.now();

                const front_page = saveFile(files.front_page.filepath, 'kyc', `${datePrefix}_${files.front_page.originalFilename.replace(/ /g, '_')}`)
                const back_page = saveFile(files.back_page.filepath, 'kyc', `${datePrefix}_${files.back_page.originalFilename.replace(/ /g, '_')}`)
                const profile = saveFile(files.image.filepath, 'profile', `${datePrefix}_${files.image.originalFilename.replace(/ /g, '_')}`)
                const bank_file = saveFile(files.bank_file.filepath, 'bank_statements', `${datePrefix}_${files.bank_file.originalFilename.replace(/ /g, '_')}`)

                const updateuser = await model.UpdateUser(profile, fields.wfa_password, user_id, fields.dob)
                const insertbank = await model.Addbank(fields.name_per_bank, fields.account_no, fields.ifsc_code, fields.swift_code, fields.bank_name, fields.branch_name, fields.currency, user_id)
                const insertdata = await model.AddUserKyc(user_id, fields.id_type, front_page, back_page, bank_file)

                if (insertdata.affectedRows > 0) {
                    const username = finduser[0]?.u_name.toUpperCase().substring(0, 3)
                    const mailAttachments = [
                        {
                            filename: `KYC_FRONT_PAGE_${username}_${date}.pdf`,
                            path: `${uploadRoot}/kyc/${datePrefix}_${files.front_page.originalFilename.replace(/ /g, '_')}`
                        },
                        {
                            filename: `KYC_BACK_PAGE_${username}_${date}.pdf`,
                            path: `${uploadRoot}/kyc/${datePrefix}_${files.back_page.originalFilename.replace(/ /g, '_')}`
                        },
                        {
                            filename: `PROFILE_${username}_${date}.${files.image.originalFilename.split('.')[1]}`,
                            path: `${uploadRoot}/profile/${datePrefix}_${files.image.originalFilename.replace(/ /g, '_')}`
                        },
                        {
                            filename: `BANK_STATEMENT_${username}_${date}.pdf`,
                            path: `${uploadRoot}/bank_statements/${datePrefix}_${files.bank_file.originalFilename.replace(/ /g, '_')}`
                        }
                    ]

                    await transporter.sendMail({
                        from: "CORAL WEALTH <nocontact@lunarenp.com>",
                        to: 'aishwaryalunar@gmail.com',
                        subject: 'KYC VERIFICATION REQUEST',
                        html: `KYC verification requested by ${finduser[0]?.u_name}, please check the admin panel.`,
                        attachments: mailAttachments
                    });

                    await model.UpdateUserKyc(user_id, fields.country, fields.currency)
                    await notifiaction.addNotification(user_id, finduser[0]?.u_role, "KYC Verification Request", "Your KYC verification request has been submitted successfully")
                    await sendNotificationToAdmins("KYC submitted", `${username} has submitted the KYC.`)

                    return res.send({ result: true, message: "Kyc submitted successfully, one of our representatives will contact you." })
                } else {
                    return res.send({ result: false, message: "Failed to upload KYC document, please try again" })
                }
            } else if (fields.verification_type === 'video') {
                return res.send({ result: false, message: "Video verification is not available" })
            } else {
                return res.send({ result: false, message: "Invalid verification type" })
            }
        })
    } catch (error) {
        return res.send({ result: false, message: error.message })
    }
}

module.exports.KycReUpload = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 587,
            auth: {
                type: 'custom',
                method: 'PLAIN',
                user: 'nocontact@lunarenp.com',
                pass: 'Cwicoral@123',
            },
        });

        const date = moment().format('YYYY_MM_DD');
        const { user_id } = req.headers;

        if (!user_id) {
            return res.send({ result: false, message: "User id is required" });
        }

        const bankData = await model.GetBank(user_id);
        const form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }

            const { kyc_id } = fields;
            if (!kyc_id) {
                return res.send({ result: false, message: "Kyc id is required" });
            }

            const checkKyc = await model.CheckKyc(user_id, kyc_id);
            if (checkKyc.length === 0) {
                return res.send({ result: false, message: "Kyc not found" });
            }

            const finduser = await model.GetUser(user_id);
            if (finduser[0]?.u_kyc === "active" || finduser[0]?.u_kyc === "pending") {
                return res.send({ result: false, message: "Kyc already submitted" });
            }

            const datePrefix = Date.now();
            let front_page = null;
            let back_page = null;
            let bank_file = null;

            if (files.front_page) {
                front_page = saveFile(
                    files.front_page.filepath,
                    'kyc',
                    `${datePrefix}_${files.front_page.originalFilename.replace(/ /g, '_')}`
                );
            }

            if (files.back_page) {
                back_page = saveFile(
                    files.back_page.filepath,
                    'kyc',
                    `${datePrefix}_${files.back_page.originalFilename.replace(/ /g, '_')}`
                );
            }

            if (files.bank_file) {
                bank_file = saveFile(
                    files.bank_file.filepath,
                    'bank_statements',
                    `${datePrefix}_${files.bank_file.originalFilename.replace(/ /g, '_')}`
                );
            }

            if (front_page || back_page || bank_file) {
                const updateKyc = await model.UpdateKyc(kyc_id, front_page, back_page, bank_file);

                if (updateKyc.affectedRows > 0) {
                    const username = finduser[0]?.u_name.toUpperCase().substring(0, 3);
                    const attachments = [];

                    if (front_page) {
                        attachments.push({
                            filename: `KYC_FRONT_PAGE_${username}_${date}.pdf`,
                            path: process.cwd() + front_page
                        });
                    }

                    if (back_page) {
                        attachments.push({
                            filename: `KYC_BACK_PAGE_${username}_${date}.pdf`,
                            path: process.cwd() + back_page
                        });
                    }

                    if (bank_file) {
                        attachments.push({
                            filename: `BANK_STATEMENT_${username}_${date}.pdf`,
                            path: process.cwd() + bank_file
                        });
                    }

                    await transporter.sendMail({
                        from: "CORAL WEALTH <nocontact@lunarenp.com>",
                        to: "aishwaryalunar@gmail.com",
                        subject: "KYC VERIFICATION REQUEST",
                        html: `
                            <p>Hello Operations Team,</p>
                            <p>${finduser[0]?.u_name} has reuploaded their KYC documents. Please review and process.</p>
                        `,
                        attachments
                    });

                    await notifiaction.addNotification(
                        user_id,
                        finduser[0]?.u_role,
                        "KYC Reupload",
                        "You have reuploaded your KYC documents."
                    );

                    await sendNotificationToAdmins("KYC Reupload", `${username} has reuploaded the KYC.`);

                    return res.send({
                        result: true,
                        message: "KYC reuploaded successfully"
                    });
                }
            }

            return res.send({
                result: false,
                message: "No files found or update failed"
            });
        });
    } catch (error) {
        return res.send({ result: false, message: error.message });
    }
};