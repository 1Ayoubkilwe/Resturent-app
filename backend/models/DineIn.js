const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    reservationDate: { type: String, required: true }, // e.g. "2026-01-02"
    reservationTime: { type: String, required: true }, // e.g. "18:00"
    seatsReserved: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Confirmed' }
}, { timestamps: true });

const tableSchema = mongoose.Schema({
    tableNumber: { type: String, required: true },
    seats: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    image: { type: String },
    reservations: [reservationSchema]
}, { timestamps: true });

const dineInSchema = mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isEnabled: { type: Boolean, default: false },
    tables: [tableSchema],
    availableTimeSlots: [{ type: String }] // e.g. ["12:00", "13:00", "18:00"]
}, { timestamps: true });

const DineIn = mongoose.model('DineIn', dineInSchema);
module.exports = DineIn;

