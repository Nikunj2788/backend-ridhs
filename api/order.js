// api/order.js

const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controller/orderController');

// POST /api/order/orders
router.post('/orders', (req, res, next) => {
  createOrder(req, res, next);
});

// POST /api/order/payment/verify
router.post('/payment/verify', (req, res, next) => {
  verifyPayment(req, res, next);
});

module.exports = router;
