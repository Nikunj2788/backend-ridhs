const orderListingService = require('../service/orderListingService');

// ✅ Controller: Get all orders
async function getAllOrders(req, res) {
  try {
    const { status, search } = req.query;

    // Create filters object
    const filters = {
      status: status || 'all',
      search: search || ''
    };

    // Call service
    const orders = await orderListingService.getAllOrders(filters);

    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

async function getOrderById(req, res) {
    try {
        const { id } = req.params;

        const order = await orderListingService.getOrderById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

async function getOrderStats(req, res) {
    try {
        const stats = await orderListingService.getOrderStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderStats
};
