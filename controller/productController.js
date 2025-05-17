const productService = require('../service/productService');
const upload = require('../config/multer'); // Use the multer config

async function handleAddProduct(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!req.body) {
        return res.status(400).json({ message: 'No product data found in request body' });
    }

    const {
        name,
        description,
        category,
        subcategory,
        price,
        discountPrice,
        colors,
        sizes,
        fabrics,
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
    } = req.body;

    // Get uploaded image filenames
    const images = req.files ? req.files.map(file => file.filename) : [];

    // Basic validation
    if (!name || !price || !category || !subcategory || !stockQuantity) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
        await productService.saveProduct({
            name,
            description,
            category,
            subcategory,
            price,
            discountPrice,
            colors,
            sizes,
            fabrics,
            images,
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
        console.error('Error saving product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Get all products with optional category filter
async function getAllProducts(req, res) {
    const { category } = req.query;
    try {
        const products = await productService.getProducts(category);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Get a single product by ID
async function getProductById(req, res) {
    const { id } = req.params;
    try {
        const product = await productService.getProductById(id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    handleAddProduct,
    getAllProducts,
    getProductById,
    upload
};

// module.exports = {
//     handleAddProduct,
//     upload
// };
