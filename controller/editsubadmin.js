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
            if (adminData[0]?.ad_role !== 'superadmin') {
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

            if (checksubadmin.length > 0) {

                let condition = ``;

                if (name) {
                    if (condition == '') {
                        condition = `set ad_name ='${name}' `  				
                    } else {
                        condition += `,ad_name='${name}'`
                    }
                }
                if (email) {
                    if (condition == '') {
                        condition = `set ad_email ='${email}' `
                    } else {
                        condition += `,ad_email='${email}'`
                    }
                }
                if (mobile) {
                    if (condition == '') {
                        condition = `set ad_phone ='${mobile}' `
                    } else {
                        condition += `,ad_phone='${mobile}'`
                    }
                }

                if (role) {
                    if (condition == '') {
                        condition = `set ad_role ='${role}' `
                    } else {
                        condition += `,ad_role='${role}'`
                    }
                }
                if (u_access) {
                    if (condition == '') {
                        condition = `set ad_access ='${u_access}' `
                    } else {
                        condition += `,ad_access='${u_access}'`
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

