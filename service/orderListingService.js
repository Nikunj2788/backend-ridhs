const db = require('../db/db');

async function getAllOrders(filters = {}) {
    try {
        let query = `
            SELECT id, shipping_details, items, subtotal, 
                   shipping AS shippingCharge, total, created_at, 
                   payment_method, payment_status, order_status
            FROM orders
        `;

        const conditions = [];
        const values = [];
        let paramCount = 1;

        // 1. Add Vendor Filter
        if (filters.vendorId) {
            conditions.push(`vendor_id = $${paramCount}`);
            values.push(filters.vendorId);
            paramCount++;
        }

        // 2. Add Search Filter
        if (filters.search) {
            conditions.push(`(
                id::text ILIKE $${paramCount} OR
                shipping_details->>'firstName' ILIKE $${paramCount} OR
                shipping_details->>'lastName' ILIKE $${paramCount} OR
                shipping_details->>'phone' ILIKE $${paramCount}
            )`);
            values.push(`%${filters.search}%`);
            paramCount++;
        }

        // 3. Add Status Filter
        if (filters.status && filters.status !== 'all') {
            conditions.push(`order_status = $${paramCount}`);
            values.push(filters.status);
            paramCount++;
        }

        // Build the WHERE clause properly
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, values);

        return result.rows.map(order => ({
            id: order.id,
            orderNumber: order.id,
            customerName: `${order.shipping_details.firstName || ''} ${order.shipping_details.lastName || ''}`.trim(),
            phone: order.shipping_details.phone || '',
            totalAmount: parseFloat(order.total),
            subtotal: parseFloat(order.subtotal),
            shippingCharge: parseFloat(order.shippingCharge || 0),
            itemCount: Array.isArray(order.items) ? order.items.length : 0,
            orderDate: order.created_at,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            status: order.order_status
        }));
    } catch (error) {
        console.error('Error in orderListingService.getAllOrders:', error);
        throw error;
    }
}

async function getOrderById(orderId) {
    try {
        const query = `
            SELECT 
                id,
                shipping_details,
                items,
                subtotal,
                shipping,
                total,
                payment_method,
                payment_status,
                order_status,
                created_at
            FROM orders
            WHERE id = $1
        `;

        const result = await db.query(query, [orderId]);

        if (result.rows.length === 0) {
            return null;
        }

        const order = result.rows[0];
        const shippingDetails = order.shipping_details;
        const items = order.items;

        // Format the response
        return {
            id: order.id,
            orderNumber: order.id,
            customerName: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
            email: shippingDetails.email || '',
            phone: shippingDetails.phone,
            orderDate: order.created_at,
            status: order.order_status,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            totalAmount: parseFloat(order.total),
            subtotal: parseFloat(order.subtotal),
            shippingCharge: parseFloat(order.shipping),
            shippingAddress: {
                firstName: shippingDetails.firstName,
                lastName: shippingDetails.lastName,
                address: shippingDetails.address,
                city: shippingDetails.city,
                country: shippingDetails.country,
                postalCode: shippingDetails.postalCode,
                phone: shippingDetails.phone
            },
            items: items.map(item => ({
                id: item.id,
                productName: item.name,
                price: parseFloat(item.price),
                imageUrl: item.imageUrl,
                quantity: item.quantity,
                color: item.color || '',
                size: item.size || '',
                category: item.category || ''
            }))
        };
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        throw error;
    }
}

async function getOrderStats(vendorId) {
    try {
        // 1. Change 'const' to 'let' so the string can be modified
        let query = `
            SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
                COUNT(CASE WHEN order_status = 'processing' THEN 1 END) as processing_orders,
                COUNT(CASE WHEN order_status = 'shipped' THEN 1 END) as shipped_orders,
                COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
                COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders,
                COALESCE(SUM(total), 0) as total_revenue,
                COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN total ELSE 0 END), 0) as completed_revenue,
                COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total ELSE 0 END), 0) as pending_revenue
            FROM orders
        `;

        const values = [];
        // 2. Append the WHERE clause if vendorId exists
        if (vendorId) {
            query += ` WHERE vendor_id = $1`;
            values.push(vendorId);
        }

        // 3. CRITICAL: You must pass 'values' as the second argument
        const result = await db.query(query, values);
        const stats = result.rows[0];

        return {
            totalOrders: parseInt(stats.total_orders) || 0,
            pendingOrders: parseInt(stats.pending_orders) || 0,
            processingOrders: parseInt(stats.processing_orders) || 0,
            shippedOrders: parseInt(stats.shipped_orders) || 0,
            deliveredOrders: parseInt(stats.delivered_orders) || 0,
            cancelledOrders: parseInt(stats.cancelled_orders) || 0,
            totalRevenue: parseFloat(stats.total_revenue) || 0,
            completedRevenue: parseFloat(stats.completed_revenue) || 0,
            pendingRevenue: parseFloat(stats.pending_revenue) || 0
        };
    } catch (error) {
        console.error('Error fetching order stats:', error);
        throw error;
    }
}

module.exports = {
    getAllOrders,
    getOrderById,
    getOrderStats
};
