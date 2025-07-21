var model = require("../model/form");
var nodemailer = require('nodemailer')
module.exports.AddForm = async(req, res) => {
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
        var {name, email, number, inv_amount, inv_type, country} = req.body;
        if(!name || !email || !number || !inv_amount){
            return res.send({
                result: false,
                message: "Insufficient parameters"
            })
        }
          email=email.toLowerCase().trim()
        let addform = await model.AddForm(name, email, number, inv_amount, inv_type, country);
        if(addform.affectedRows > 0){
            let data = [
                {
                        email: email,
                        subject: 'Team Registered With Us',
                        html: ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        
        <h1 style="color: #333; text-align: center;">Welcome to Coral Wealth!</h1>
        <p style="font-size: 16px; color: #555;">Dear User,</p>
        <p style="font-size: 16px; color: #555;">
            Thank you for registering with us. We're excited to have you on board!
        </p>
        <p style="font-size: 16px; color: #555;">
            If you have any questions or need assistance, feel free to reach out to our support team.
        </p>
        <a href="https://youtube.com" style="display: block; text-align: center; margin: 20px 0; padding: 10px 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Visit Our Website</a>
        <p style="font-size: 16px; color: #555;">Best regards,</p>
        <p style="font-size: 16px; color: #555;">Coral Wealth Team</p>
        </div>`
        
                },
                {
                    email: "lunardigitalmarketingtraning@gmail.com,Mubashirpmmubz@gmail.com",
                    subject: `New Enquiry From : ${name}`,
                    html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Customer Details</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .customer-details {
                    margin-bottom: 20px;
                }
                .customer-details p {
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Customer Details</h1>
                <div class="customer-details">
                    <p>Name: <span id="customer-name">${name}</span></p>
                    <p>Email: <span id="customer-email">${email}</span></p>
                    <p>Phone: <span id="customer-phone">${number}</span></p>
                    <p>Investment Amount: <span id="customer-name">${inv_amount}</span></p>
                    <p>Investment Type: <span id="customer-name">${inv_type}</span></p>
                    <p>Country: <span id="customer-name">${country}</span></p>
                </div>
            </div>
        </body>
        </html>
        `
                }
            ]
            let output = await Promise.all(data.map(async (element) => {
                let info = await transporter.sendMail({
                    from: "CORAL WEALTH <nocontact@lunarenp.com>",
                    to: element.email,
                    subject: element.subject,
                    html: element.html
                });
        
                nodemailer.getTestMessageUrl(info);
                return true
        
            }));
            return res.send({
                result: true,
                message: "Form add successfully"
            })
        }else{
            return res.send({
                result: false,
                message: "Failed to add form"
            })
        }
    } catch (error) {
        res.send({
            result: false,
            message: error.message
        })
    }
};