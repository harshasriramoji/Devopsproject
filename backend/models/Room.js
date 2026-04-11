const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    capacity: { type: Number, default: 1 },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available',
    },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);