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

module.exports = { createOrder, verifyPayment, updateOrder };
