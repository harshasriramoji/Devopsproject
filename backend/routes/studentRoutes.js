const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getStudentDashboard,
    getProfile,
    getRoomDetails,
    submitComplaint,
    getNotices,
} = require('../controllers/studentController');
const router = express.Router();

router.get('/dashboard', protect, authorize('student'), getStudentDashboard);
router.get('/profile', protect, authorize('student'), getProfile);
router.get('/room', protect, authorize('student'), getRoomDetails);
router.post('/complaints', protect, authorize('student'), submitComplaint);
router.get('/notices', protect, authorize('student'), getNotices);

module.exports = router;