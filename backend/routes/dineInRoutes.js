const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const DineIn = require('../models/DineIn');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @desc    Get dine-in settings for a restaurant
// @route   GET /api/dine-in
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    let dineIn = await DineIn.findOne({ restaurant: req.user._id });
    if (!dineIn) {
        dineIn = await DineIn.create({
            restaurant: req.user._id,
            tables: [],
            availableTimeSlots: ["12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"]
        });
    }
    res.json(dineIn);
}));

// @desc    Update dine-in settings (toggle enabled)
// @route   PUT /api/dine-in/toggle
// @access  Private
router.put('/toggle', protect, asyncHandler(async (req, res) => {
    const dineIn = await DineIn.findOne({ restaurant: req.user._id });
    if (dineIn) {
        dineIn.isEnabled = !dineIn.isEnabled;
        await dineIn.save();
        res.json(dineIn);
    } else {
        res.status(404);
        throw new Error('Dine-in settings not found');
    }
}));

// @desc    Add a table
// @route   POST /api/dine-in/table
// @access  Private
router.post('/table', protect, upload.single('image'), asyncHandler(async (req, res) => {
    const { name, capacity, price } = req.body;
    const dineIn = await DineIn.findOne({ restaurant: req.user._id });

    let image = "";
    if (req.file) {
        image = req.file.path.replace(/\\/g, "/");
    }

    if (dineIn) {
        dineIn.tables.push({ tableNumber: name, seats: capacity, price, image });
        await dineIn.save();
        res.status(201).json(dineIn);
    } else {
        res.status(404);
        throw new Error('Dine-in settings not found');
    }
}));

// @desc    Delete a table
// @route   DELETE /api/dine-in/table/:id
// @access  Private
router.delete('/table/:id', protect, asyncHandler(async (req, res) => {
    const dineIn = await DineIn.findOne({ restaurant: req.user._id });
    if (dineIn) {
        dineIn.tables = dineIn.tables.filter(t => t._id.toString() !== req.params.id);
        await dineIn.save();
        res.json(dineIn);
    } else {
        res.status(404);
        throw new Error('Dine-in settings not found');
    }
}));

// @desc    Update available time slots
// @route   PUT /api/dine-in/slots
// @access  Private
router.put('/slots', protect, asyncHandler(async (req, res) => {
    const { slots } = req.body;
    const dineIn = await DineIn.findOne({ restaurant: req.user._id });
    if (dineIn) {
        dineIn.availableTimeSlots = slots;
        await dineIn.save();
        res.json(dineIn);
    } else {
        res.status(404);
        throw new Error('Dine-in settings not found');
    }
}));

module.exports = router;

