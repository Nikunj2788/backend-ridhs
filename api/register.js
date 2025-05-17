const express = require('express');
const router = express.Router();
const { handleRegisterForm } = require('../controller/registerController');

console.log('✅ register.js loaded'); // 👈 Add this

router.post('/', (req, res, next) => {
  console.log('➡️ POST /api/register route hit'); // 👈 Add this
  handleRegisterForm(req, res, next);
});

module.exports = router;
