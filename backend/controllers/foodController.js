const asyncHandler = require('express-async-handler');
const FoodItem = require('../models/FoodItem');

// @desc    Get all food items
// @route   GET /api/food
// @access  Public
const getFoodItems = asyncHandler(async (req, res) => {
    const foodItems = await FoodItem.find({ restaurant: req.user._id });
    res.json(foodItems);
});

// @desc    Create food item
// @route   POST /api/food
// @access  Private/Admin
const createFoodItem = asyncHandler(async (req, res) => {
    const { name, price, description } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = req.file.path.replace(/\\/g, "/"); // Normalize path for web
    }

    const foodItem = await FoodItem.create({
        name,
        price,
        description,
        image,
        restaurant: req.user._id,
    });

    res.status(201).json(foodItem);
});

// @desc    Update food item
// @route   PUT /api/food/:id
// @access  Private/Admin
const updateFoodItem = asyncHandler(async (req, res) => {
    const { name, price, description } = req.body;
    const foodItem = await FoodItem.findById(req.params.id);

    if (foodItem) {
        // Check for ownership
        if (foodItem.restaurant.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this item');
        }

        foodItem.name = name || foodItem.name;
        foodItem.price = price || foodItem.price;
        foodItem.description = description || foodItem.description;

        if (req.file) {
            foodItem.image = req.file.path.replace(/\\/g, "/");
        }

        const updatedFoodItem = await foodItem.save();
        res.json(updatedFoodItem);
    } else {
        res.status(404);
        throw new Error('Food item not found');
    }
});

// @desc    Delete food item
// @route   DELETE /api/food/:id
// @access  Private/Admin
const deleteFoodItem = asyncHandler(async (req, res) => {
    const foodItem = await FoodItem.findById(req.params.id);

    if (foodItem) {
        // Check for ownership
        if (foodItem.restaurant.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this item');
        }

        await foodItem.deleteOne();
        res.json({ message: 'Food item removed' });
    } else {
        res.status(404);
        throw new Error('Food item not found');
    }
});

module.exports = {
    getFoodItems,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
};
