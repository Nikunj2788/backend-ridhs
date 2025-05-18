const express = require('express');
const router = express.Router();
const {
    handleAddProduct,
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getTrendingProducts,
    upload
} = require('../controller/productController');

// Add a new product
router.post('/add', upload.array('images'), handleAddProduct);

// Get all products or filtered by category
router.get('/', getAllProducts);

// Get featured products
router.get('/featured', getFeaturedProducts);

// Optional: Get trending products
router.get('/trending', getTrendingProducts);

// Get product by ID
router.get('/:id', getProductById);

module.exports = router;

