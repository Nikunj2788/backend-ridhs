const express = require('express');
const router = express.Router();
const { handleRegister } = require('../controller/registerController');

// POST /api/register
router.post('/', handleRegister);

module.exports = router;
