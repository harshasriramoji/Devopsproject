const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');

const getAdminDashboard = async(req, res) => {
    const studentCount = await Student.countDocuments();
    const staffCount = await Staff.countDocuments();
    const roomCount = await Room.countDocuments();
    const openComplaints = await Complaint.countDocuments({ status: { $in: ['Pending', 'open'] } });

    res.json({
        counts: { studentCount, staffCount, roomCount, openComplaints },
        user: req.user,
    });
};

const findUserByEmail = async(email) => {
    return (
        (await Admin.findOne({ email })) ||
        (await Staff.findOne({ email })) ||
        (await Student.findOne({ email }))
    );
};

const getStudents = async(req, res) => {
    const students = await Student.find().populate('room');
    res.json(students);
};

const createStudent = async(req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (await findUserByEmail(email)) {
        return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, email, password: hashedPassword });
    res.status(201).json(student);
};

const updateStudent = async(req, res) => {
    const { id } = req.params;
    const updates = {...req.body };

    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    const student = await Student.findByIdAndUpdate(id, updates, { new: true }).populate('room');
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
};

const deleteStudent = async(req, res) => {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    if (student.room) {
        await Room.findByIdAndUpdate(student.room, { $pull: { occupants: student._id } });
    }

    await student.remove();
    res.json({ message: 'Student deleted successfully' });
};

const getStaff = async(req, res) => {
    const staff = await Staff.find();
    res.json(staff);
};

const createStaff = async(req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (await findUserByEmail(email)) {
        return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await Staff.create({ name, email, password: hashedPassword });
    res.status(201).json(staff);
};

const updateStaff = async(req, res) => {
    const { id } = req.params;
    const updates = {...req.body };

    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    const staff = await Staff.findByIdAndUpdate(id, updates, { new: true });
    if (!staff) {
        return res.status(404).json({ message: 'Staff not found' });
    }

    res.json(staff);
};

const deleteStaff = async(req, res) => {
    const { id } = req.params;
    const staff = await Staff.findById(id);
    if (!staff) {
        return res.status(404).json({ message: 'Staff not found' });
    }

    await staff.remove();
    res.json({ message: 'Staff deleted successfully' });
};

const getRooms = async(req, res) => {
    const rooms = await Room.find().populate('occupants', 'name email');
    res.json(rooms);
};

const createRoom = async(req, res) => {
    const { number, type, capacity } = req.body;
    if (!number || !type) {
        return res.status(400).json({ message: 'Room number and type are required' });
    }

    const existingRoom = await Room.findOne({ number });
    if (existingRoom) {
        return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = await Room.create({ number, type, capacity: capacity || 1 });
    res.status(201).json(room);
};

const updateRoom = async(req, res) => {
    const { id } = req.params;
    const updates = {...req.body };

    const room = await Room.findByIdAndUpdate(id, updates, { new: true }).populate('occupants', 'name email');
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
};

const deleteRoom = async(req, res) => {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }

    await Student.updateMany({ room: room._id }, { $unset: { room: '' } });
    await room.remove();
    res.json({ message: 'Room deleted successfully' });
};

const allocateRoom = async(req, res) => {
    const { id } = req.params;
    const { studentId } = req.body;
    const room = await Room.findById(id);
    const student = await Student.findById(studentId);

    if (!room || !student) {
        return res.status(404).json({ message: 'Room or student not found' });
    }

    if (room.occupants.length >= room.capacity) {
        return res.status(400).json({ message: 'Room is already full' });
    }

    if (student.room && student.room.toString() === room._id.toString()) {
        return res.status(400).json({ message: 'Student already assigned to this room' });
    }

    if (student.room) {
        await Room.findByIdAndUpdate(student.room, { $pull: { occupants: student._id } });
    }

    room.occupants.push(student._id);
    student.room = room._id;

    await room.save();
    await student.save();

    res.json({ message: 'Room allocated successfully', room, student });
};

const getComplaints = async(req, res) => {
    const complaints = await Complaint.find().populate('student', 'name email');
    res.json(complaints);
};

const getNotices = async(req, res) => {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
};

const getReports = async(req, res) => {
    const students = await Student.countDocuments();
    const staff = await Staff.countDocuments();
    const rooms = await Room.countDocuments();
    const openComplaints = await Complaint.countDocuments({ status: 'open' });
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

    res.json({
        summary: {
            students,
            staff,
            rooms,
            openComplaints,
            maintenanceRooms,
        },
    });
};

module.exports = {
    getAdminDashboard,
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    allocateRoom,
    getComplaints,
    getNotices,
    getReports,
};