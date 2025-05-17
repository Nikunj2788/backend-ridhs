const express = require('express');
const router = express.Router();
const { handleRegisterForm } = require('../controller/registerController');

// Define POST route for contact form submission
router.post('/', handleRegisterForm);

module.exports = router;
