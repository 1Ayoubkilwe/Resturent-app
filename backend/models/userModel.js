const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    phone: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    isRestaurantOpen: {
        type: Boolean,
        default: true
    },
    workingHours: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "22:00" }
    },
    language: {
        type: String,
        default: "en"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
