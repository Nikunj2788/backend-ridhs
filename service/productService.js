// Correct the query to use pool.query() for PostgreSQL
const { Pool } = require('pg');
const db = require('../db/db');

async function saveProduct(productData) {
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
        // Save product data into the "products" table
        const query = `
            INSERT INTO products (
                name, description, category, subcategory, price, discount_price,
                stock_quantity, is_featured, is_trending, care_instructions, material_composition,
                occasion, pattern, length, width, weight, blouse_included, blouse_fabric,
                blouse_length, stitching_type, sleeve_type, neck_type, work_type, border_type, zari_type
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            RETURNING id
        `;

        // Convert empty strings to null for numeric fields
        const values = [
            name,
            description,
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
            zariType || null
        ];

        // Perform the query using pool.query() for PostgreSQL
        const result = await db.query(query, values); // ✅ Correct for PostgreSQL
        const productId = result.rows[0].id; // Get the inserted product id

        // Process the associated images, colors, sizes, and fabrics as you did before
        if (colors && colors.length > 0) {
            const colorQuery = `INSERT INTO product_colors (product_id, color) VALUES ($1, $2)`;
            for (let color of colors) {
                await db.query(colorQuery, [productId, color]);
            }
        }

        if (sizes && sizes.length > 0) {
            const sizeQuery = `INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)`;
            for (let size of sizes) {
                await db.query(sizeQuery, [productId, size]);
            }
        }

        if (fabrics && fabrics.length > 0) {
            const fabricQuery = `INSERT INTO product_fabrics (product_id, fabric) VALUES ($1, $2)`;
            for (let fabric of fabrics) {
                await db.query(fabricQuery, [productId, fabric]);
            }
        }

        // Handle images, assuming images are already saved to disk and you store the URLs in the database
        if (images && images.length > 0) {
            const imageQuery = `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)`;
            for (let image of images) {
                const imageUrl = image;  // Assuming `image` is a URL or file path
                await db.query(imageQuery, [productId, imageUrl]);
            }
        }

    } catch (error) {
        console.error('Error saving product:', error);
        throw error;
    }
}

module.exports = { saveProduct };
