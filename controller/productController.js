const productService = require('../service/productService');
const upload = require('../config/multer');
const { uploadToDrive, FOLDER_ID, drive, auth } = require('../config/googleDrive');

async function handleAddProduct(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const {
        name, vendor_id, description, main_category, category, subcategory, price, discountPrice,
        colors, sizes, fabrics, stockQuantity, isFeatured, isTrending,
        careInstructions, materialComposition, occasion, pattern, length,
        width, weight, blouseIncluded, blouseFabric, blouseLength,
        stitchingType, sleeveType, neckType, workType, borderType, zariType,
    } = req.body;

    if (!vendor_id) {
        return res.status(400).json({ message: 'Vendor ID is required to link product' });
    }

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
            vendor_id,
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
    const vendorId = req.query.vendorId;
    try {
        const products = await productService.getProducts(includeDeleted, vendorId);
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

async function handleBulkAddProducts(req, res) {
    try {
        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Products array is required' });
        }

        const results = await Promise.allSettled(
            products.map((product) =>
                productService.saveProduct({
                    ...product,
                    price: product.price || null,
                    discountPrice: product.discountPrice || null,
                    stockQuantity: product.stockQuantity || null,
                })
            )
        );

        const success = [];
        const failed = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                success.push({
                    index,
                    name: products[index].name,
                });
            } else {
                failed.push({
                    index,
                    name: products[index].name,
                    error: result.reason?.message || 'Unknown error',
                });
            }
        });

        res.status(207).json({
            message: 'Bulk upload processed',
            total: products.length,
            successCount: success.length,
            failedCount: failed.length,
            success,
            failed,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Bulk upload failed' });
    }
}

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file required' });
        }

        const { shareableUrl } = await uploadToDrive(req.file);

        res.status(200).json({ url: shareableUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Image upload failed' });
    }
};

const uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Image files required' });
        }

        const urls = [];

        for (const file of req.files) {
            const { shareableUrl } = await uploadToDrive(file);
            urls.push(shareableUrl);
        }

        res.status(200).json({ urls });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Bulk image upload failed' });
    }
};

const createUploadSession = async (req, res) => {
    try {
        const { fileName, mimeType } = req.body;

        // 1. Get Access Token
        const authClient = await auth.getClient();
        const tokenResponse = await authClient.getAccessToken();
        const accessToken = tokenResponse.token;

        // 2. Create the file metadata FIRST using the drive library
        // This gives us the fileId immediately and reliably
        const fileMetadata = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [FOLDER_ID],
            },
            fields: 'id',
        });

        const fileId = fileMetadata.data.id;

        // 3. Now start the resumable session for this specific File ID
        // Note the URL change: it now includes the fileId
        const googleRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=resumable`, {
            method: 'PATCH', // Use PATCH to update the existing empty file with content
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Upload-Content-Type': mimeType,
            },
        });

        const uploadUrl = googleRes.headers.get('location');

        if (!uploadUrl) {
            throw new Error('Failed to generate uploadUrl from Google.');
        }

        // 4. Make it public
        await drive.permissions.create({
            fileId: fileId,
            requestBody: { role: 'reader', type: 'anyone' },
        });

        const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

        console.log('✅ SUCCESS: Session Created for ID:', fileId);

        res.json({
            uploadUrl,
            fileId,
            publicUrl
        });

    } catch (err) {
        console.error('🔴 SESSION ERROR:', err.message);
        res.status(500).json({ error: err.message });
    }
};


const proxyUpload = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const fileName = req.file.originalname;
        const mimeType = req.file.mimetype;

        // 1. Get Access Token (Same as your session logic)
        const authClient = await auth.getClient();
        const tokenResponse = await authClient.getAccessToken();
        const accessToken = tokenResponse.token;

        // 2. Create Metadata
        const fileMetadata = await drive.files.create({
            requestBody: { name: fileName, parents: [FOLDER_ID] },
            fields: 'id',
        });
        const fileId = fileMetadata.data.id;

        // 3. Start Resumable Session
        const sessionRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=resumable`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Upload-Content-Type': mimeType,
            },
        });

        const uploadUrl = sessionRes.headers.get('location');

        // 4. PERFORM THE ACTUAL UPLOAD FROM SERVER (Fixes CORS)
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': mimeType },
            body: req.file.buffer, // Sending the binary data from server
        });

        if (uploadRes.status !== 200) throw new Error('Google Upload Failed');

        // 5. Make it public
        await drive.permissions.create({
            fileId: fileId,
            requestBody: { role: 'reader', type: 'anyone' },
        });

        const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

        console.log('✅ Proxy Upload Success:', fileId);
        res.json({ publicUrl, fileId });

    } catch (err) {
        console.error('🔴 PROXY ERROR:', err.message);
        res.status(500).json({ error: err.message });
    }
};
const finalizeUpload = async (req, res) => {
    try {
        const { fileId } = req.body;

        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        res.json({
            publicUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to finalize upload' });
    }
};


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
    handleBulkAddProducts,
    uploadImage,
    uploadMultipleImages,
    createUploadSession,
    finalizeUpload,
    proxyUpload,
};
