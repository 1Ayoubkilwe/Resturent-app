const express = require('express');
const router = express.Router();
const { getRandomMeal } = require('../controllers/externalController');

router.get('/random-meal', getRandomMeal);

module.exports = router;
