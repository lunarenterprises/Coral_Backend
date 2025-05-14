const userModel = require('../model/users')
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET);


module.exports.createClientSecret = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length === 0) {
            return res.send({
                result: false,
                message: "User not found"
            })
        }
        let { amount } = req.body
        if (!amount) {
            return res.send({
                result: false,
                message: "Amount is required"
            })
        }
        console.log("amount : ", amount)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'AED',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                user_id
            }
        });
        if (paymentIntent) {
            await userModel.createPaymentHistory(user_id, amount, userData[0]?.u_currency, paymentIntent?.id, paymentIntent?.client_secret)
            return res.send({
                result: true,
                clientSecret: paymentIntent.client_secret
            })
        } else {
            return res.send({
                result: false,
                message: "Payment failed!"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })

    }
}

module.exports.getPaymentDetails = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length === 0) {
            return res.send({
                result: false,
                message: "User not found"
            })
        }
        const paymentIntent = await stripe.paymentIntents.retrieve(
            'pi_3R2r6vFEOzMlpKTY1HQReHbN'
        );
        if (paymentIntent) {
            return res.send({
                result: true,
                message: "Data retrived successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "No data found"
            })
        }
    } catch (error) {
        console.log(error.message)
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.UpdatePaymentStatus = async (req, res) => {
    try {
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let userData = await userModel.getUser(user_id)
        if (userData.length === 0) {
            return res.send({
                result: false,
                message: "User not found"
            })
        }
        let { investment_id } = req.body
        if (!investment_id) {
            return res.send({
                result: false,
                message: "Investment id is required"
            })
        }
        let status = "success" ? "paid" : "failed"
        let updatePaymentStatus = await userModel.updatePaymentStatus(investment_id, status)
        if (updatePaymentStatus.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Payment status updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to update payment status"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}