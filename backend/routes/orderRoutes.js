const express = require('express');
const router = express.Router();
const { getMyOrders, updateOrderStatus, createOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMyOrders).post(createOrder);
router.route('/:id/status').put(protect, updateOrderStatus);

module.exports = router;
