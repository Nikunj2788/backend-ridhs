const productService = require('../service/productService');
const upload = require('../config/multer'); // Use the multer config

// Helper function to generate the image URL (adjust base URL as needed)
const generateImageUrl = (imageFilename) => {
    if (imageFilename) {
        // Assuming images are served from 'https://your-domain.com/uploads/'
        return `http://localhost:3001/uploads/${imageFilename}`;
    }
    return null;  // Fallback if there's no image
};

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

        // Add full image URLs
        const productsWithImageUrls = products.map((product) => ({
            ...product,
            image_url: generateImageUrl(product.image_url),
        }));

        res.status(200).json(productsWithImageUrls);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Get a single product by ID
async function getProductById(req, res) {
    console.log('Request params:', req.params); // Check what is inside req.params
    const { id } = req.params;  // Should retrieve id from params
    
    // Add extra logging to verify
    console.log(`Product ID: ${id}`);
    
    try {
        // Make sure id is available
        if (!id) {
            return res.status(400).json({ message: 'ID parameter is missing' });
        }

        // Fetch product from the service
        const product = await productService.getProductById(id);
        
        if (product) {
            // Generate the full image URL
            product.image_url = generateImageUrl(product.image_url);  // Update the image URL with the full path
            
            res.status(200).json(product);  // Send product with full image URL
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

        // Map through products to generate full image URLs
        const productsWithImageUrls = products.map((product) => {
            return {
                ...product,
                image_url: generateImageUrl(product.image_url),  // Add the full image URL
            };
        });

        res.status(200).json(productsWithImageUrls);
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

module.exports = {
    handleAddProduct,
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getTrendingProducts,
    upload,
};
