const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Notice = require('../models/Notice');

const getStaffDashboard = async(req, res) => {
    const assignedStudents = await Student.countDocuments();
    const openComplaints = await Complaint.countDocuments({ status: { $in: ['Pending', 'open'] } });
    const roomsInMaintenance = await Room.countDocuments({ status: 'maintenance' });

    res.json({
        counts: { assignedStudents, openComplaints, roomsInMaintenance },
        user: req.user,
    });
};

const getAssignedStudents = async(req, res) => {
    const students = await Student.find().populate('room');
    res.json(students);
};

const getComplaints = async(req, res) => {
    const complaints = await Complaint.find().populate('student', 'name email');
    res.json(complaints);
};

const updateComplaintStatus = async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(id, { status }, { new: true }).populate('student', 'name email');
    if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
};

const updateRoomStatus = async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const room = await Room.findByIdAndUpdate(id, { status }, { new: true }).populate('occupants', 'name email');
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
};

const postNotice = async(req, res) => {
    const { title, message } = req.body;
    if (!title || !message) {
        return res.status(400).json({ message: 'Title and message are required' });
    }

    const notice = await Notice.create({ title, message, author: req.user.email, role: 'staff' });
    res.status(201).json(notice);
};

const getRooms = async(req, res) => {
    const rooms = await Room.find().populate('occupants', 'name email');
    res.json(rooms);
};

const getNotices = async(req, res) => {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
};

module.exports = {
    getStaffDashboard,
    getAssignedStudents,
    getComplaints,
    updateComplaintStatus,
    updateRoomStatus,
    getRooms,
    postNotice,
    getNotices,
};