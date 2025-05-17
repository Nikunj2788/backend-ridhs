const express = require('express');
const router = express.Router();
const { handleLoginForm } = require('../controller/loginController');

console.log('✅ login.js loaded');

router.post('/', (req, res, next) => {
    console.log('➡️ POST /api/login route hit');
    handleLoginForm(req, res, next);
});

module.exports = router;
