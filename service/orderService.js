const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,     // <- fix here
  key_secret: process.env.RAZORPAY_KEY_SECRET // <- fix here
});

async function createOrder(orderData) {
  const {
    items,
    shippingDetails,
    total,
    subtotal,
    shipping,
    payment_method,
    payment_status,
    user_id,
    vendor_id
  } = orderData;

  const query = `
    INSERT INTO orders (
        items, 
        shipping_details, 
        total, 
        subtotal, 
        shipping, 
        payment_method, 
        payment_status, 
        user_id, 
        vendor_id,
        order_status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `;

  const values = [
    JSON.stringify(items),
    JSON.stringify(shippingDetails),
    total,
    subtotal,
    shipping,
    payment_method || 'Razorpay',
    payment_status || 'pending',
    user_id || null,
    vendor_id || null,
    'pending'
  ];

  const result = await db.query(query, values);
  const orderId = result.rows[0].id;

  const options = {
    amount: Math.round(total * 100),
    currency: 'INR',
    receipt: `order_${orderId}`
  };

  const razorpayOrder = await razorpay.orders.create(options);
  return { id: razorpayOrder.id, db_id: orderId };
}

async function verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not defined in environment variables");
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
}

async function updateOrder(orderId, updateData) {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query based on what fields are provided
    if (updateData.order_status !== undefined) {
      fields.push(`order_status = $${paramCount}`);
      values.push(updateData.order_status);
      paramCount++;
    }

    if (updateData.payment_status !== undefined) {
      fields.push(`payment_status = $${paramCount}`);
      values.push(updateData.payment_status);
      paramCount++;
    }

    if (updateData.payment_method !== undefined) {
      fields.push(`payment_method = $${paramCount}`);
      values.push(updateData.payment_method);
      paramCount++;
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add order ID as the last parameter
    values.push(orderId);

    const query = `
            UPDATE orders 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}


module.exports = { createOrder, verifyPayment, updateOrder };
