var model = require("../model/userlogin");
var bcrypt = require("bcrypt");
var randtoken = require('rand-token');
let notifications = require('../util/saveNotification')
const jwt = require('jsonwebtoken');

module.exports.Login = async (req, res) => {
    try {
        let device_id = req.body.device_id;
        let device_os = req.body.device_os;
        let device_token = req.body.device_token;
        let password = req.body.password;
        let email = req.body.email;
        let app_version = req.body.app_version;
        let fcm_token = req.body.fcm_token

        if (!device_id || !device_os || !device_token || !password || !email || !fcm_token) {
            return res.send({
                result: false,
                message: "insufficient parameters",
            });
        }
        email = email.toLowerCase().trim()
        let CheckUser = await model.CheckUserQuery(email);
        if (CheckUser.length > 0) {
            if (CheckUser[0]?.u_is_registered === 0) {
                return res.send({
                    result: false,
                    message: "OTP verification pending"
                })
            }
            let Checkpassword = await bcrypt.compare(
                password,
                CheckUser[0].u_password
            );
            if (Checkpassword == true) {
                let CheckUserapps = await model.CheckUserAppsQuery(
                    CheckUser[0].u_id,
                    device_id,
                    device_os
                );
                var api_key = null;
                if (CheckUserapps.length > 0) {
                    api_key = randtoken.generate(32);
                    await model.UpdateUserAppsQuery(
                        device_token,
                        api_key,
                        app_version,
                        CheckUserapps[0].user_apps_id,
                        fcm_token
                    )
                } else {
                    api_key = randtoken.generate(32);
                    await model.InsertUserAppsQuery(
                        device_id,
                        device_os,
                        device_token,
                        CheckUser[0].u_id,
                        api_key,
                        app_version,
                        fcm_token
                    )
                }
                const payload = {
                    email: CheckUser[0].u_email,
                    user_id: CheckUser[0].u_id,
                    role: CheckUser[0].u_role

                };
                const token = jwt.sign(
                    payload,
                    process.env.SECRET_KEY,
                    {}
                );
                await notifications.addNotification(CheckUser[0].u_id, CheckUser[0].u_role, 'User Login', `User ${CheckUser[0].u_name} logged in successfully`)
                return res.send({
                    result: true,
                    message: "you are successfully logged in",
                    user_id: CheckUser[0].u_id,
                    user_name: CheckUser[0].u_name,
                    user_email: CheckUser[0].u_email,
                    user_mobile: CheckUser[0].u_mobile,
                    user_role: CheckUser[0].u_role,
                    user_api_key: api_key,
                    user_status: CheckUser[0].u_status,
                    user_kyc: CheckUser[0].u_kyc,
                    token
                })
            } else {
                return res.send({
                    result: false,
                    message: "incorrect password please check and try again",
                });
            }
        } else {
            return res.send({
                result: false,
                message: "email not registered with us",
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });
    }
};
