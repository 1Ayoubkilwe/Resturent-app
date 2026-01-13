const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './.env' });
const Category = require('./models/Category');

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const categories = ['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Dessert'];

        for (let name of categories) {
            const exists = await Category.findOne({ name });
            if (!exists) {
                await Category.create({ name });
                console.log(`Category created: ${name}`);
            }
        }
        console.log('Seeding completed');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedCategories();
