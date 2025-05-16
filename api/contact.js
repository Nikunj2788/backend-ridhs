const express = require('express');
const router = express.Router();
const { handleContactForm } = require('../controller/contactController');

// Define POST route for contact form submission
router.post('/', handleContactForm);

module.exports = router;
