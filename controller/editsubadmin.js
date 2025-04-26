var model = require('../model/editsubadmin')
var formidable = require('formidable')
var fs = require('fs')

module.exports.EditSubAdmin = async (req, res) => {
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
            if (adminData[0]?.u_role !== 'superadmin') {
                return res.send({
                    result: false,
                    message: "Access Denied,try with authorized account"
                })
            }

            let { subadmin_id, name, email, mobile, role, u_access } = fields

            if (!subadmin_id) {
                return res.send({
                    result: false,
                    messaage: "insufficient parameter"
                })
            }
            var checksubadmin = await model.ChecksubadminQuery(subadmin_id)
            console.log(checksubadmin);

            if (checksubadmin.length > 0) {
                console.log(subadmin_id);

                let condition = ``;

                if (name) {
                    if (condition == '') {
                        condition = `set u_name ='${name}' `
                    } else {
                        condition += `,u_name='${name}'`
                    }
                }
                if (email) {
                    if (condition == '') {
                        condition = `set u_email ='${email}' `
                    } else {
                        condition += `,u_email='${email}'`
                    }
                }
                if (mobile) {
                    if (condition == '') {
                        condition = `set u_mobile ='${mobile}' `
                    } else {
                        condition += `,u_mobile='${mobile}'`
                    }
                }

                if (role) {
                    if (condition == '') {
                        condition = `set u_role ='${role}' `
                    } else {
                        condition += `,u_role='${role}'`
                    }
                }
                if (u_access) {
                    if (condition == '') {
                        condition = `set u_access ='${u_access}' `
                    } else {
                        condition += `,u_access='${u_access}'`
                    }
                }


                if (condition !== '') {
                    var Editsubadmin = await model.Changesubadmin(condition, subadmin_id)
                }
                if (Editsubadmin) {

                    if (files.image) {
                        var oldPath = files.image.filepath;
                        var newPath =
                            process.cwd() +
                            "/uploads/profile/admin/" + files.image.originalFilename
                        let rawData = fs.readFileSync(oldPath);
                        console.log(oldPath);

                        fs.writeFileSync(newPath, rawData)
                        var image = "uploads/profile/admin/" + files.image.originalFilename

                        var Insertsubadminimage = await model.Updateimage(image, subadmin_id)

                        if (Insertsubadminimage.affectedRows) {
                            return res.send({
                                result: true,
                                message: "subadmin updated successfully"
                            })
                        } else {
                            return res.send({
                                result: false,
                                message: "failed to update subadmin"
                            })
                        }

                    }
                    return res.send({
                        result: true,
                        message: "subadmin updated successfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "failed to update subadmin"
                    })
                }

            } else {
                return res.send({
                    result: false,
                    message: "subadmin does not exists"
                })
            }
        })

    } catch
    (error) {
        return res.send({
            result: false,
            message: error.message
        })

    }
}

