// const express = require('express');
// const router = express.Router();
// const { handleAddProduct, upload } = require('../controller/productController');

// router.post('/add', upload.array('images'), handleAddProduct);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { handleAddProduct, getAllProducts, getProductById, upload } = require('../controller/productController');

// Add a new product
router.post('/add', upload.array('images'), handleAddProduct);

// Get all products with optional category filter
router.get('/', getAllProducts);

// Get a single product by ID
router.get('/:id', getProductById);

module.exports = router;
