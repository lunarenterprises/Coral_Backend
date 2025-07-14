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

            console.log("files : ", files)
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
                console.log("Files saved:", { front_page, back_page, profile, bank_file });
                const updateuser = await model.UpdateUser(profile, fields.wfa_password, user_id, fields.dob)
                console.log("updateuser : ", updateuser);
                const insertbank = await model.Addbank(fields.name_per_bank, fields.account_no, fields.ifsc_code, fields.swift_code, fields.bank_name, fields.branch_name, fields.currency, user_id)
                console.log("insertbank : ", insertbank);
                const insertdata = await model.AddUserKyc(user_id, fields.id_type, front_page, back_page, bank_file)
                console.log("insertdata : ", insertdata);


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
                        to: 'operations@coraluae.com',
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
                            path: `${uploadRoot}/${front_page.replace(/^uploads\//, '')}`
                        });
                    }

                    if (back_page) {
                        attachments.push({
                            filename: `KYC_BACK_PAGE_${username}_${date}.pdf`,
                            path: `${uploadRoot}/${back_page.replace(/^uploads\//, '')}`
                        });
                    }

                    if (bank_file) {
                        attachments.push({
                            filename: `BANK_STATEMENT_${username}_${date}.pdf`,
                            path: `${uploadRoot}/${bank_file.replace(/^uploads\//, '')}`
                        });
                    }

                    await transporter.sendMail({
                        from: "CORAL WEALTH <nocontact@lunarenp.com>",
                        to: "operations@coraluae.com",
                        subject: "KYC VERIFICATION REQUEST",
                        html: `
                            <p>Hello Operations Team,</p>
                            <p><strong>${finduser[0]?.u_name}</strong> has reuploaded their KYC documents. Please review and process.</p>
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