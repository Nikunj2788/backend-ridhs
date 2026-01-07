const db = require('../db/db');

// Save product data into the database
async function saveProduct(productData) {
    const {
        name,
        description,
        main_category,
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
    } = productData;

    try {
        const query = `
        INSERT INTO products (
            name, description, main_category,category, subcategory, price, discount_price,
            stock_quantity, is_featured, is_trending, care_instructions, material_composition,
            occasion, pattern, length, width, weight, blouse_included, blouse_fabric,
            blouse_length, stitching_type, sleeve_type, neck_type, work_type, border_type, zari_type
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25,$26)
        RETURNING id
        `;

        const values = [
            name,
            description,
            main_category,
            category,
            subcategory,
            price === '' ? null : Number(price),
            discountPrice === '' ? null : Number(discountPrice),
            stockQuantity === '' ? null : Number(stockQuantity),
            isFeatured,
            isTrending,
            careInstructions || null,
            materialComposition || null,
            occasion || null,
            pattern || null,
            length === '' ? null : Number(length),
            width === '' ? null : Number(width),
            weight === '' ? null : Number(weight),
            blouseIncluded,
            blouseFabric || null,
            blouseLength || null,
            stitchingType || null,
            sleeveType || null,
            neckType || null,
            workType || null,
            borderType || null,
            zariType || null,
        ];
        console.log('Values array length:', values.length);
        console.log('Values array:', values);
        console.log('Main category value:', main_category);

        const result = await db.query(query, values);
        const productId = result.rows[0].id;

        // Insert into product_colors
        if (colors && colors.length > 0) {
            const colorQuery = `INSERT INTO product_colors (product_id, color) VALUES ($1, $2)`;
            for (let color of colors) {
                await db.query(colorQuery, [productId, color]);
            }
        }

        // Insert into product_sizes
        if (sizes && sizes.length > 0) {
            const sizeQuery = `INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)`;
            for (let size of sizes) {
                if (typeof size === 'string' && size.trim().length > 0) {
                    await db.query(sizeQuery, [productId, size.trim()]);
                }
            }

        }

        // Insert into product_fabrics
        if (fabrics && fabrics.length > 0) {
            const fabricQuery = `INSERT INTO product_fabrics (product_id, fabric) VALUES ($1, $2)`;
            for (let fabric of fabrics) {
                await db.query(fabricQuery, [productId, fabric]);
            }
        }

        // Insert into product_images
        if (images && images.length > 0) {
            const imageQuery = `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)`;
            for (let image of images) {
                await db.query(imageQuery, [productId, image]);
            }
        }

    } catch (error) {
        console.error('Error saving product:', error);
        throw error;
    }
}



// ✅ Final version of getProductById with images and sizes
async function getProductById(id) {
    console.log(`Inside productService - ID: ${id}`);

    // Fetch the product
    const productQuery = `
    SELECT * FROM products WHERE id = $1
  `;
    const productResult = await db.query(productQuery, [id]);

    console.log('Product Query Result:', productResult.rows);

    if (productResult.rows.length === 0) {
        console.log('Product not found.');
        return null;
    }

    const product = productResult.rows[0];

    // Fetch all images
    const imageQuery = `SELECT image_url FROM product_images WHERE product_id = $1`;
    const imageResult = await db.query(imageQuery, [id]);
    product.images = imageResult.rows.map(row => row.image_url);
    console.log('Product Images:', product.images);

    // Fetch all sizes
    const sizeQuery = `SELECT size FROM product_sizes WHERE product_id = $1`;
    const sizeResult = await db.query(sizeQuery, [id]);
    product.sizes = sizeResult.rows.map(row => row.size);
    console.log('Product Sizes:', product.sizes); // 🟡 Debug: Log sizes result

    // Fetch all colors
    const colorQuery = `SELECT color FROM product_colors WHERE product_id = $1`;
    const colorResult = await db.query(colorQuery, [id]);
    product.colors = colorResult.rows.map(row => row.color);
    console.log('Product Colors:', product.colors);

    // Final product object before returning
    console.log('Final Product Object:', product);

    return product;
}


async function getProducts(includeDeleted = false) {
    // If includeDeleted is false, we only show live products (for customers)
    // If true, we show everything (for admin)
    const productQuery = includeDeleted
        ? `SELECT * FROM products ORDER BY id DESC`
        : `SELECT * FROM products WHERE deleted = false ORDER BY id DESC`;

    const productResult = await db.query(productQuery);
    const products = productResult.rows;

    for (let product of products) {
        const imageQuery = `
            SELECT image_url
            FROM product_images
            WHERE product_id = $1
            ORDER BY id ASC
            LIMIT 1
        `;
        const imageResult = await db.query(imageQuery, [product.id]);
        product.image_url = imageResult.rows[0]?.image_url || null;
    }

    return products;
}

async function updateProductStatus(id, isDeleted) {
    const query = `UPDATE products SET deleted = $1 WHERE id = $2 RETURNING *`;
    const result = await db.query(query, [isDeleted, id]);
    return result.rows[0];
}

// 2. Update Details (Name and Price)
async function updateProductDetails(id, data) {
    const { name, price, stock_quantity } = data;
    const query = `
        UPDATE products 
        SET name = $1, price = $2, stock_quantity = $3
        WHERE id = $4 
        RETURNING *
    `;
    const result = await db.query(query, [name, price, stock_quantity, id]);
    return result.rows[0];
}


async function getFeaturedProducts() {
    try {
        const query = `
            SELECT 
                p.*,
                pi.image_url,
                COALESCE(
                    json_agg(DISTINCT ps.size) 
                    FILTER (WHERE ps.size IS NOT NULL), 
                    '[]'
                ) AS sizes,
                COALESCE(
                    json_agg(DISTINCT pc.color) 
                    FILTER (WHERE pc.color IS NOT NULL), 
                    '[]'
                ) AS colors
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id
            LEFT JOIN product_sizes ps ON ps.product_id = p.id
            LEFT JOIN product_colors pc ON pc.product_id = p.id
            WHERE p.is_featured = true
            GROUP BY p.id, pi.image_url
        `;

        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        throw error;
    }
}

async function getTrendingProducts() {
    try {
        const query = `
      SELECT p.*, pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE p.is_trending = true
    `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching trending products:', error);
        throw error;
    }
}

module.exports = {
    saveProduct,
    getProductById,
    getProducts,
    getFeaturedProducts,
    getTrendingProducts,
    updateProductStatus,
    updateProductDetails
};
