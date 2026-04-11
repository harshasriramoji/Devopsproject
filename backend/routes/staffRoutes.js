const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getStaffDashboard,
    getAssignedStudents,
    getComplaints,
    updateComplaintStatus,
    updateRoomStatus,
    getRooms,
    postNotice,
    getNotices,
} = require('../controllers/staffController');
const router = express.Router();

router.get('/dashboard', protect, authorize('staff'), getStaffDashboard);
router.get('/assigned-students', protect, authorize('staff'), getAssignedStudents);
router.get('/complaints', protect, authorize('staff'), getComplaints);
router.put('/complaints/:id', protect, authorize('staff'), updateComplaintStatus);
router.get('/rooms', protect, authorize('staff'), getRooms);
router.put('/rooms/:id/status', protect, authorize('staff'), updateRoomStatus);
router.post('/notices', protect, authorize('staff'), postNotice);
router.get('/notices', protect, authorize('staff'), getNotices);
module.exports = router;