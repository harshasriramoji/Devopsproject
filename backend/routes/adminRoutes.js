const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');
const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);

router.get('/students', protect, authorize('admin'), getStudents);
router.post('/students', protect, authorize('admin'), createStudent);
router.put('/students/:id', protect, authorize('admin'), updateStudent);
router.delete('/students/:id', protect, authorize('admin'), deleteStudent);

router.get('/staff', protect, authorize('admin'), getStaff);
router.post('/staff', protect, authorize('admin'), createStaff);
router.put('/staff/:id', protect, authorize('admin'), updateStaff);
router.delete('/staff/:id', protect, authorize('admin'), deleteStaff);

router.get('/rooms', protect, authorize('admin'), getRooms);
router.post('/rooms', protect, authorize('admin'), createRoom);
router.put('/rooms/:id', protect, authorize('admin'), updateRoom);
router.delete('/rooms/:id', protect, authorize('admin'), deleteRoom);
router.post('/rooms/:id/allocate', protect, authorize('admin'), allocateRoom);

router.get('/complaints', protect, authorize('admin'), getComplaints);
router.get('/notices', protect, authorize('admin'), getNotices);
router.get('/reports', protect, authorize('admin'), getReports);

module.exports = router;