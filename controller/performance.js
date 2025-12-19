var model = require('../model/performance')

module.exports.Performance = async (req, res) => {
    try {
        let { user_id } = req.user
        let year = [2024, 2025, 2026, 2027, 2028, 2029, 2030]

        var array = await Promise.all(year.map(async (element) => {
            var obj = {}
            obj.year = element
            var ui_amount = 0
            var ui_return = 0
            var percent = 0
            let check = await model.getWithdraw(user_id, element)
            if (check.length > 0) {
                check.forEach(el => {
                    percent = (ui_return / ui_amount) * 100
                    ui_amount += el.ui_amount
                    ui_return += el.ui_return
                    obj.total_amount = ui_amount
                    obj.return_amount = el.ui_return
                    obj.percentage = percent
                });
            } else {
                obj.total_amount = 0
                obj.return_amount = 0
                obj.percentage = 0
            }
            return obj

        }));
        return res.send({
            result: true,
            message: "data retrieved",
            data: array
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}