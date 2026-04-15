const express = require('express');
const router = express.Router();
const {
	registerPatientAccount,
	loginPatientAccount,
	getMyPatientProfile,
	getMyAppointments,
	getBookingAvailability,
	bookAppointment,
	getAppointmentStatus,
	updateAppointmentStatus,
	getAllAppointmentsAdmin,
	deleteAppointmentAdmin,
	editAppointmentAdmin,
	callNextPatient,
	getLiveStatus
} = require('../controllers/patientController');
const { protect, authorize, protectPatient } = require('../middleware/auth');

router.post('/register', registerPatientAccount);
router.post('/login', loginPatientAccount);
router.get('/me', protectPatient, getMyPatientProfile);
router.get('/my-appointments', protectPatient, getMyAppointments);
router.get('/booking-availability', getBookingAvailability);

router.post('/book', bookAppointment);
router.get('/track/:trackingId', getAppointmentStatus);

// Admin Routes
router.get('/admin/all', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC', 'ADMIN_ACADEMIC', 'ADMIN_COLLEGE', 'ADMIN_HOSTEL'), getAllAppointmentsAdmin);
router.patch('/admin/:id/status', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), updateAppointmentStatus);
router.patch('/admin/next/:department', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), callNextPatient);
router.get('/live-status/:department', getLiveStatus);
router.put('/admin/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), editAppointmentAdmin);
router.delete('/admin/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), deleteAppointmentAdmin);

module.exports = router;
