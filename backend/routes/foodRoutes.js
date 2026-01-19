const express = require('express');
const router = express.Router();
const {
    getFoodItems,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
} = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(protect, getFoodItems).post(protect, upload.single('image'), createFoodItem);
router.route('/:id').put(protect, upload.single('image'), updateFoodItem).delete(protect, deleteFoodItem);

module.exports = router;
