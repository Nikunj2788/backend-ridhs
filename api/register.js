const express = require('express');
const router = express.Router();
const { handleRegisterForm } = require('../controller/registerController');

router.post('/', (req, res, next) => {
  handleRegisterForm(req, res, next);
});

module.exports = router;
