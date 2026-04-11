const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createComplaint,
    getAllComplaints,
    updateComplaintStatus,
} = require('../controllers/complaintController');

const router = express.Router();

router.post('/', protect, authorize('student'), createComplaint);
router.get('/', protect, authorize(['staff', 'admin', 'student']), getAllComplaints);
router.patch('/:id', protect, authorize(['staff', 'admin']), updateComplaintStatus);

module.exports = router;