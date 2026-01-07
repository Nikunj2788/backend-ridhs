const productService = require('../service/productService');
const upload = require('../config/multer');
const { uploadToDrive } = require('../config/googleDrive'); // ✅ adjust path if needed


async function handleAddProduct(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const {
        name, description, main_category, category, subcategory, price, discountPrice,
        colors, sizes, fabrics, stockQuantity, isFeatured, isTrending,
        careInstructions, materialComposition, occasion, pattern, length,
        width, weight, blouseIncluded, blouseFabric, blouseLength,
        stitchingType, sleeveType, neckType, workType, borderType, zariType,
    } = req.body;

    // Convert comma-separated strings to arrays (if applicable)
    const parsedColors = typeof colors === 'string' ? colors.split(',').map(c => c.trim()) : colors;
    const parsedSizes = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()) : sizes;
    const parsedFabrics = typeof fabrics === 'string' ? fabrics.split(',').map(f => f.trim()) : fabrics;

    const imageUrls = [];
    if (req.files && req.files.length > 0) {
        for (let file of req.files) {
            const { shareableUrl } = await uploadToDrive(file);
            imageUrls.push(shareableUrl);
        }
    }

    if (!name || !price || !main_category || !category || !subcategory || !stockQuantity) {
        console.warn('⚠️ Missing required fields');
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
        await productService.saveProduct({
            name,
            description,
            main_category,
            category,
            subcategory,
            price,
            discountPrice,
            colors: parsedColors,
            sizes: parsedSizes,
            fabrics: parsedFabrics,
            images: imageUrls,
            stockQuantity,
            isFeatured,
            isTrending,
            careInstructions,
            materialComposition,
            occasion,
            pattern,
            length,
            width,
            weight,
            blouseIncluded,
            blouseFabric,
            blouseLength,
            stitchingType,
            sleeveType,
            neckType,
            workType,
            borderType,
            zariType,
        });

        res.status(200).json({ message: 'Product added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// Get all products with optional category filter
async function getAllProducts(req, res) {
    const includeDeleted = req.query.includeDeleted === 'true';
    try {
        const products = await productService.getProducts(includeDeleted);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Get a single product by ID
async function getProductById(req, res) {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ message: 'ID parameter is missing' });
        }

        const product = await productService.getProductById(id);

        if (product) {
            // ✅ Don't use generateImageUrl here
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}




// Get featured products
async function getFeaturedProducts(req, res) {
    try {
        const products = await productService.getFeaturedProducts();

        // No need to generate full image URLs — they are already stored
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// Optional: trending
async function getTrendingProducts(req, res) {
    try {
        const products = await productService.getTrendingProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching trending products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function softDeleteProduct(req, res) {
    const { id } = req.params;
    try {
        await productService.updateProductStatus(id, true); // Sets deleted = true
        res.status(200).json({ message: 'Product moved to trash' });
    } catch (error) {
        console.error('Error soft deleting product:', error);
        res.status(500).json({ message: 'Error moving product to trash' });
    }
}

/**
 * RESTORE: Bring product back from trash
 * Route: PATCH /api/products/:id/restore
 */
async function restoreProduct(req, res) {
    const { id } = req.params;
    try {
        await productService.updateProductStatus(id, false); // Sets deleted = false
        res.status(200).json({ message: 'Product restored successfully' });
    } catch (error) {
        console.error('Error restoring product:', error);
        res.status(500).json({ message: 'Error restoring product' });
    }
}

/**
 * UPDATE: Update specific fields (name, price)
 * Route: PUT /api/products/:id
 */
async function updateProduct(req, res) {
    const { id } = req.params;
    const updateData = req.body; // Contains { name, price, etc. }

    try {
        const updated = await productService.updateProductDetails(id, updateData);
        if (updated) {
            res.status(200).json({ message: 'Product updated successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    handleAddProduct,
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getTrendingProducts,
    softDeleteProduct,
    restoreProduct,
    updateProduct,
    upload,
};
