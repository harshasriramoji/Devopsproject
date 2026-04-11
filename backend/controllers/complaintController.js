const Complaint = require('../models/Complaint');
const Student = require('../models/Student');

const createComplaint = async(req, res) => {
    const { complaintTitle, complaintDescription, roomNumber } = req.body;
    if (!complaintTitle || !complaintDescription || !roomNumber) {
        return res.status(400).json({ message: 'Title, description and room number are required' });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    const complaint = await Complaint.create({
        studentName: student.name,
        studentEmail: student.email,
        roomNumber,
        complaintTitle,
        complaintDescription,
        status: 'Pending',
        student: student._id,
    });

    res.status(201).json(complaint);
};

const getAllComplaints = async(req, res) => {
    const filter = {};

    if (req.user.role === 'student') {
        filter.student = req.user.id;
    } else if (req.query.status && req.query.status !== 'All') {
        const status = req.query.status;
        if (status === 'Pending') {
            filter.status = { $in: ['Pending', 'open'] };
        } else if (status === 'In Progress') {
            filter.status = { $in: ['In Progress', 'in-progress'] };
        } else if (status === 'Resolved') {
            filter.status = { $in: ['Resolved', 'resolved'] };
        } else {
            filter.status = status;
        }
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
};

const updateComplaintStatus = async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findByIdAndUpdate(id, { status }, { new: true });
    if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
};

module.exports = {
    createComplaint,
    getAllComplaints,
    updateComplaintStatus,
};