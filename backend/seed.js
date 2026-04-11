const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Staff = require('./models/Staff');
const Student = require('./models/Student');
const Room = require('./models/Room');
const Complaint = require('./models/Complaint');
const Notice = require('./models/Notice');

dotenv.config();

const seed = async() => {
    await connectDB();

    await Promise.all([
        Admin.deleteMany(),
        Staff.deleteMany(),
        Student.deleteMany(),
        Room.deleteMany(),
        Complaint.deleteMany(),
        Notice.deleteMany(),
    ]);

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const staffPassword = await bcrypt.hash('Staff@123', 10);
    const studentPassword = await bcrypt.hash('Student@123', 10);

    const admin = await Admin.create({
        name: 'Admin User',
        email: 'admin@hostel.com',
        password: adminPassword,
    });

    const staff = await Staff.create({
        name: 'Staff User',
        email: 'staff@hostel.com',
        password: staffPassword,
    });

    const student = await Student.create({
        name: 'Student User',
        email: 'student@hostel.com',
        password: studentPassword,
    });

    const room = await Room.create({
        number: 'A101',
        type: 'Single',
        capacity: 1,
        status: 'available',
    });

    const notice = await Notice.create({
        title: 'Welcome to Hostel',
        message: 'Please follow hostel rules and report any issues to staff.',
        author: 'System',
        role: 'staff',
    });

    await Complaint.create({
        title: 'Light not working',
        description: 'The light in room A101 is flickering.',
        student: student._id,
    });

    console.log('Seed data created:');
    console.log({ admin: admin.email, staff: staff.email, student: student.email });
    process.exit(0);
};

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});