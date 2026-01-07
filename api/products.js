const express = require('express');
const router = express.Router();
const {
    handleAddProduct,
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getTrendingProducts,
    softDeleteProduct,
    restoreProduct,
    updateProduct,
    upload
} = require('../controller/productController');

// Add a new product
router.post('/add', upload.array('images'), handleAddProduct);

// Get all products (Admin uses this with ?includeDeleted=true)
router.get('/', getAllProducts);

// Featured and Trending
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);

// Get product by ID
router.get('/:id', getProductById);

// Update name and price (The Edit Modal)
router.put('/:id', updateProduct);

// Move to Trash (Soft Delete)
router.patch('/:id/delete', softDeleteProduct);

// Restore from Trash
router.patch('/:id/restore', restoreProduct);

module.exports = router;