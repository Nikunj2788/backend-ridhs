const orderService = require('../service/orderService');

async function createOrder(req, res) {
    try {
        const orderData = req.body;
        const order = await orderService.createOrder(orderData);
        res.status(201).json({ orderId: order.id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order' });
    }
}

async function verifyPayment(req, res) {
    try {
        const { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
        const isValid = await orderService.verifyPayment(orderCreationId, razorpayPaymentId, razorpaySignature);
        if (isValid) {
            res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verifying payment' });
    }
}

module.exports = { createOrder, verifyPayment };
