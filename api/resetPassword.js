const express = require('express');
const router = express.Router();
const { resetPassword } = require('../controller/forgotPasswordController');

router.post('/', resetPassword); // POST /api/reset-password

module.exports = router;
