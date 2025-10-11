const express = require('express');
const router = express.Router();
const orderListingController = require('../controller/orderListingController');

router.get('/', orderListingController.getAllOrders);

router.get('/stats', orderListingController.getOrderStats);

router.get('/:id', orderListingController.getOrderById);

module.exports = router;
