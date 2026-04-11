const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    author: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff',
    },
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);