var model = require('../model/projectlist')

module.exports.ProjectList = async (req, res) => {
    try {
        let projectslist = await model.getCompanyInvest() 
        if(projectslist.length > 0){
            return res.send({
                result:true,
                message:"data retrieved successfully",
                data:projectslist
            })
        }else{
            return res.send({
                result:false,
                message:"failed to get data"
            }) 
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}