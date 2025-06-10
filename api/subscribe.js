const express = require('express');
const router = express.Router();
const { subscribeEmail } = require('../controller/configController');

router.post('/', subscribeEmail);

module.exports = router;