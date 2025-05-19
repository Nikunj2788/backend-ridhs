const db = require('../db/db');

// Save product data into the database
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
            zariType || null,
        ];

        const result = await db.query(query, values);
        const productId = result.rows[0].id;

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


// ✅ Optional: Define getProducts to avoid export error
async function getProducts() {
    const query = `SELECT * FROM products`;
    const result = await db.query(query);
    return result.rows;
}

async function getFeaturedProducts() {
    try {
        const query = `
      SELECT p.*, pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE p.is_featured = true
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
    getProducts, // ✅ Now defined
    getFeaturedProducts,
    getTrendingProducts,
};
