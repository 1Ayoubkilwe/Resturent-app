const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = req.file.path.replace(/\\/g, "/"); // Normalize path for web
    }

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({ name, image });
    res.status(201).json(category);
});

// @desc    Get all food items
// @route   GET /api/food
// @access  Public
const getFoodItems = asyncHandler(async (req, res) => {
    const foodItems = await FoodItem.find({ restaurant: req.user._id }).populate('category', 'name');
    res.json(foodItems);
});

// @desc    Create food item
// @route   POST /api/food
// @access  Private/Admin
const createFoodItem = asyncHandler(async (req, res) => {
    const { name, price, description, category } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = req.file.path.replace(/\\/g, "/"); // Normalize path for web
    }

    const foodItem = await FoodItem.create({
        name,
        price,
        description,
        image,
        category,
        restaurant: req.user._id,
    });

    res.status(201).json(foodItem);
});

// @desc    Get food items by category
// @route   GET /api/food/category/:categoryId
// @access  Public
const getFoodByCategory = asyncHandler(async (req, res) => {
    const foodItems = await FoodItem.find({
        category: req.params.categoryId,
        restaurant: req.user._id
    }).populate('category', 'name');
    res.json(foodItems);
});

// @desc    Update food item
// @route   PUT /api/food/:id
// @access  Private/Admin
const updateFoodItem = asyncHandler(async (req, res) => {
    const { name, price, description, category } = req.body;
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
        foodItem.category = category || foodItem.category;

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
    getCategories,
    createCategory,
    getFoodItems,
    createFoodItem,
    getFoodByCategory,
    updateFoodItem,
    deleteFoodItem,
};
