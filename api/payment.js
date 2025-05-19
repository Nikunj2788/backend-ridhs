const express = require('express');
const router = express.Router();
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

router.post('/create-order', async (req, res) => {
    const { amount, currency, receipt } = req.body;

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // convert to paise
            currency: currency || 'INR',
            receipt: receipt || `receipt_order_${Date.now()}`
        });

        res.status(200).json({ order });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

module.exports = router;
