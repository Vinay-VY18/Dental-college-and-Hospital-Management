const express = require('express');
const router = express.Router();
const { addComplaint, getComplaints, updateComplaintStatus, deleteComplaint, editComplaintAdmin } = require('../controllers/hostelController');
const { protect, authorize } = require('../middleware/auth');

router.post('/hostel/complaints', addComplaint);
router.get('/admin/hostel/complaints', protect, authorize('SUPER_ADMIN', 'ADMIN_HOSTEL', 'ADMIN_ACADEMIC', 'ADMIN_COLLEGE', 'ADMIN_CLINIC'), getComplaints);
router.patch('/admin/hostel/complaints/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_HOSTEL'), updateComplaintStatus);
router.put('/admin/hostel/complaints/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_HOSTEL'), editComplaintAdmin);
router.delete('/admin/hostel/complaints/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_HOSTEL'), deleteComplaint);

module.exports = router;
