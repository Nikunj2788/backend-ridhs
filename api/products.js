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
    upload,
    handleBulkAddProducts,
    uploadImage,
    uploadMultipleImages,
    createUploadSession,
    finalizeUpload,
    proxyUpload,
} = require('../controller/productController');

// Add a new product (uses multer)
router.post('/add', upload.array('images'), handleAddProduct);

// Get all products
router.get('/', getAllProducts);

// Featured and Trending
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);

// Get product by ID
router.get('/:id', getProductById);

// Update product
router.put('/:id', updateProduct);

// Soft delete
router.patch('/:id/delete', softDeleteProduct);

// Restore
router.patch('/:id/restore', restoreProduct);

// Bulk product upload (JSON only)
router.post('/bulk', handleBulkAddProducts);

// Single image upload (multer → drive)
router.post('/upload', upload.single('image'), uploadImage);

// Multiple image upload (multer → drive)
router.post('/upload-multiple', upload.array('images', 100), uploadMultipleImages);

//  Direct-to-Google-Drive (NO multer)
router.post('/create-upload-session', createUploadSession);

router.post('/finalize-upload', finalizeUpload);

router.post('/proxy-upload', upload.single('file'), proxyUpload);

module.exports = router;
