const orderService = require('../service/orderService');

async function createOrder(req, res) {
  try {
    const orderData = req.body;
    const order = await orderService.createOrder(orderData);
    res.status(201).json({ orderId: order.id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
}

async function verifyPayment(req, res) {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const isValid = await orderService.verifyPayment(
      razorpayOrderId, // not orderCreationId
      razorpayPaymentId,
      razorpaySignature
    );

    if (isValid) {
      res.status(200).json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
}

async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate order status if provided
    if (updateData.order_status) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(updateData.order_status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status. Must be one of: ' + validStatuses.join(', ')
        });
      }
    }

    // Validate payment status if provided
    if (updateData.payment_status) {
      const validPaymentStatuses = ['pending', 'completed', 'failed', 'cancelled'];
      if (!validPaymentStatuses.includes(updateData.payment_status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status. Must be one of: ' + validPaymentStatuses.join(', ')
        });
      }
    }

    const updatedOrder = await orderService.updateOrder(id, updateData);

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

async function submitReview(req, res) {
  try {
    const { product_id, order_id, user_id, vendor_id, rating, comment } = req.body;

    // Basic Validation
    if (!product_id || !order_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Order ID, and Rating are required.'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    const review = await orderService.submitReview({
      product_id,
      order_id,
      user_id,
      vendor_id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('❌ Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}

async function getOrdersByUser(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const orders = await orderService.getOrdersByUserId(userId);

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = { createOrder, verifyPayment, updateOrder, submitReview, getOrdersByUser };