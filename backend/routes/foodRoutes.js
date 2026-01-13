const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    getFoodItems,
    createFoodItem,
    getFoodByCategory,
    updateFoodItem,
    deleteFoodItem,
} = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/categories').get(protect, getCategories).post(protect, upload.single('image'), createCategory);
router.route('/').get(protect, getFoodItems).post(protect, upload.single('image'), createFoodItem);
router.route('/:id').put(protect, upload.single('image'), updateFoodItem).delete(protect, deleteFoodItem);
router.route('/category/:categoryId').get(protect, getFoodByCategory);

module.exports = router;
