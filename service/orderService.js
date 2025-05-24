const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,     // <- fix here
  key_secret: process.env.RAZORPAY_KEY_SECRET // <- fix here
});

async function createOrder(orderData) {
  const { items, shippingDetails, total, subtotal, shipping } = orderData;

  // Save order to database
  const query = `
    INSERT INTO orders (items, shipping_details, total, subtotal, shipping)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const values = [JSON.stringify(items), JSON.stringify(shippingDetails), total, subtotal, shipping];
  const result = await db.query(query, values);
  const orderId = result.rows[0].id;

  // Create Razorpay order
  const options = {
    amount: total * 100,
    currency: 'INR',
    receipt: `order_${orderId}`,
    payment_capture: 1
  };
  const order = await razorpay.orders.create(options);

  return { id: order.id };
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

module.exports = { createOrder, verifyPayment };
