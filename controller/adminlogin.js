var model = require("../model/adminlogin");
var bcrypt = require("bcrypt");
var randtoken = require('rand-token');
var jwt = require('jsonwebtoken');


module.exports.AdminLogin = async (req, res) => {
    try {

        let { device_id, device_os, device_token, password, email, app_version, fcm_token } = req.body;

        if (!password || !email) {
            return res.send({
                result: false,
                message: "insufficient parameters",
            });
        }
        var SECRET_KEY = process.env.JWT_SECRET_KEY


        var CheckUser = await model.CheckUserQuery(email);

        if (CheckUser[0]?.u_status !== 'active') {
            return res.send({
                result: false,
                message: "Your Access Denied,Please contact management",
            });
        }
        if (CheckUser.length > 0) {
            let Checkpassword = await bcrypt.compare(
                password,
                CheckUser[0].u_password
            );
            if (Checkpassword == true) {
                const payload = {
                    email: CheckUser[0].u_email,
                    admin_id: CheckUser[0].u_id,
                    role: CheckUser[0].u_role

                };

                const token = jwt.sign(
                    payload,
                    SECRET_KEY,
                    {}
                );
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
                        fcm_token,
                        app_version,
                        CheckUserapps[0].user_apps_id)
                } else {
                    api_key = randtoken.generate(32);
                    await model.InsertUserAppsQuery(
                        device_id,
                        device_os,
                        device_token,
                        CheckUser[0].u_id,
                        api_key,
                        fcm_token,
                        app_version
                    )
                }
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
                    user_token: token

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
