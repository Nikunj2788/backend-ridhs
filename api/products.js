const express = require('express');
const router = express.Router();
const { handleAddProduct, upload } = require('../controller/productController');

router.post('/add', upload.array('images'), handleAddProduct);

module.exports = router;
