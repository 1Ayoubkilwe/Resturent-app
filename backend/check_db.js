const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './.env' });
const User = require('./models/userModel');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await User.countDocuments();
        console.log(`Total users in database: ${count}`);
        const users = await User.find({}, 'name email');
        console.log('Users:', users);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkUsers();
