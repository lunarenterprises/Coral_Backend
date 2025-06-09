let model = require('../model/industryGrowth')


module.exports.GetIndustryGrowth = async (req, res) => {
    try {
        let { user_id } = req.header
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let { industry_id } = req.body
        if (!industry_id) {
            return res.send({
                result: false,
                message: "Industry id is required"
            })
        }
        let industryData = await model.GetIndustryGrowth(industry_id)
        if (getindustry.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                data: industryData
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