const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    roomNumber: { type: String, required: true },
    complaintTitle: { type: String, required: true },
    complaintDescription: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'open', 'In Progress', 'resolved', 'Resolved'],
        default: 'Pending',
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);