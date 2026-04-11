const Student = require('../models/Student');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');

const getStudentDashboard = async(req, res) => {
    const student = await Student.findById(req.user.id).populate('room');
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ student, user: req.user });
};

const getProfile = async(req, res) => {
    const student = await Student.findById(req.user.id).select('-password').populate('room');
    if (!student) {
        return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(student);
};

const getRoomDetails = async(req, res) => {
    const student = await Student.findById(req.user.id).populate('room');
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ room: student.room || null });
};

const submitComplaint = async(req, res) => {
    const { title, description, roomNumber } = req.body;
    if (!title || !description || !roomNumber) {
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
        complaintTitle: title,
        complaintDescription: description,
        title,
        description,
        status: 'Pending',
        student: req.user.id,
    });

    const noticeMessage = `Student ${req.user.email} submitted a complaint: ${title}.`;
    try {
        await Promise.all([
            Notice.create({ title: 'New complaint submitted', message: noticeMessage, author: req.user.email, role: 'staff' }),
            Notice.create({ title: 'New complaint submitted', message: noticeMessage, author: req.user.email, role: 'admin' }),
        ]);
    } catch (error) {
        console.error('Complaint notification creation failed:', error);
    }

    res.status(201).json(complaint);
};

const getNotices = async(req, res) => {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
};

module.exports = {
    getStudentDashboard,
    getProfile,
    getRoomDetails,
    submitComplaint,
    getNotices,
};