const express = require('express');
const router = express.Router();
const { forgotPassword } = require('../controller/forgotPasswordController.js');

router.post('/', forgotPassword);

module.exports = router;
