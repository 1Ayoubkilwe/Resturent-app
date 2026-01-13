const axios = require('axios');
const asyncHandler = require('express-async-handler');

// @desc    Get a random meal from TheMealDB
// @route   GET /api/external/random-meal
// @access  Public
const getRandomMeal = asyncHandler(async (req, res) => {
    try {
        const response = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch data from external API');
    }
});

module.exports = {
    getRandomMeal,
};
