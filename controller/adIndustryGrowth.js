var model = require("../model/adIndustryGrowth");

module.exports.AddIndustryGrowth = async (req, res) => {
    try {
        // let IndustryGrowth_id = req.user.IndustryGrowth_id
        // let IndustryGrowth_role = req.user.role

        // var IndustryGrowthData = await model.getIndustryGrowth(IndustryGrowth_id, IndustryGrowth_role)
        // if (IndustryGrowthData[0]?.ad_role == 'user') {
        //     return res.send({
        //         result: false,
        //         message: "Access Denied,try with authorized account"
        //     })
        // }
        var { ig_industries_id,ig_year,ig_growths } = req.body
        if (!ig_industries_id || !ig_year || !ig_growths) {
            return res.send({
                result: false,
                message: "insufficent parameter"
            })
        }
        let addIndustryGrowth = await model.AddIndustryGrowthQuery(ig_industries_id,ig_year,ig_growths)

        if (addIndustryGrowth.affectedRows > 0) {

            return res.send({
                result: true,
                message: "Industries Growth added successfully"
            });

        } else {
            return res.send({
                result: true,
                message: "failed to add Industries Growth "
            })
        }


    } catch (error) {
        console.log(error);
        return res.send({
            result: false,
            message: error.message,
        });
    }

}



module.exports.IndustryGrowthList = async (req, res) => {

    try {

        var industry_id = req.body.industry_id

        var getindustry = await model.getIndustryGrowthList(industry_id)

        if (getindustry.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                data: getindustry
            })
        } else {
            return res.send({
                result: false,
                message: "IndustryGrowth details not found"
            })
        }


    } catch (error) {

        return res.send({
            result: false,
            message: error.message
        })

    }

}