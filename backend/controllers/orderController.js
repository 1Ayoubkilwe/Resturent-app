const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// @desc    Get all orders for a restaurant
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ restaurant: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Create new order (for testing/demo)
// @route   POST /api/orders
// @access  Public
const createOrder = asyncHandler(async (req, res) => {
    const { restaurant, customer, items, totalPrice } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            restaurant,
            customer,
            items,
            totalPrice,
            status: 'New'
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
});

module.exports = {
    getMyOrders,
    updateOrderStatus,
    createOrder
};
