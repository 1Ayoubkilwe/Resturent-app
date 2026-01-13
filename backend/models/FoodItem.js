const mongoose = require('mongoose');

const foodItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isAvailable: { type: Boolean, default: true }
}, {
    timestamps: true
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
module.exports = FoodItem;
