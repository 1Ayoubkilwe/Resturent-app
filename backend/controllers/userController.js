const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    email = email.trim().toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            restaurantImages: user.restaurantImages,
            coordinates: user.coordinates,
            isRestaurantOpen: user.isRestaurantOpen,
            workingHours: user.workingHours,
            language: user.language,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    email = email.trim().toLowerCase();

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            restaurantImages: user.restaurantImages,
            coordinates: user.coordinates,
            isRestaurantOpen: user.isRestaurantOpen,
            workingHours: user.workingHours,
            language: user.language,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Google Login
// @route   POST /api/users/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    let { email, name, googleId } = req.body;
    email = email.trim().toLowerCase();

    // Check for user
    const user = await User.findOne({ email });

    if (user) {
        // User exists, login
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                restaurantImages: user.restaurantImages,
                coordinates: user.coordinates,
                isRestaurantOpen: user.isRestaurantOpen,
                workingHours: user.workingHours,
                language: user.language,
                token: generateToken(user._id),
            });
    } else {
        // User doesn't exist, create new user
        // Generate random password
        const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            res.status(201).json({
                _id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                location: newUser.location,
                restaurantImages: newUser.restaurantImages,
                coordinates: newUser.coordinates,
                isRestaurantOpen: newUser.isRestaurantOpen,
                workingHours: newUser.workingHours,
                language: newUser.language,
                token: generateToken(newUser._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const parsedIsOpen = req.body.isRestaurantOpen !== undefined
            ? (req.body.isRestaurantOpen === true || req.body.isRestaurantOpen === 'true')
            : undefined;

        user.name = req.body.name?.trim() || user.name;
        user.phone = req.body.phone || user.phone;
        user.location = req.body.location || user.location;

        if (parsedIsOpen !== undefined) {
            user.isRestaurantOpen = parsedIsOpen;
        }

        if (req.body.workingHours) {
            user.workingHours = req.body.workingHours;
        }

        if (req.body.language) {
            user.language = req.body.language;
        }

        if (req.body.latitude && req.body.longitude) {
            user.coordinates = {
                lat: Number(req.body.latitude),
                lng: Number(req.body.longitude),
            };
        }

        const existingImages = req.body.existingImages
            ? JSON.parse(req.body.existingImages)
            : user.restaurantImages || [];

        const uploadedImages = (req.files || []).map((file) => `/uploads/${file.filename}`);
        user.restaurantImages = [...existingImages, ...uploadedImages];

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location,
            restaurantImages: updatedUser.restaurantImages,
            coordinates: updatedUser.coordinates,
            isRestaurantOpen: updatedUser.isRestaurantOpen,
            workingHours: updatedUser.workingHours,
            language: updatedUser.language,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    updateProfile,
};
