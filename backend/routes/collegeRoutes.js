const express = require('express');
const router = express.Router();
const { getEvents, getHospitalEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/collegeController');
const {
  getAdmissions, getResearch, createAdmission, createResearch, 
  updateAdmission, updateResearch, deleteAdmission, deleteResearch,
  getFaculty, createFaculty, updateFaculty, deleteFaculty
} = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

// College Events — registered under BOTH /events and /calendar for backward compatibility
router.get('/events', getEvents);
router.post('/events', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), createEvent);
router.put('/events/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), updateEvent);
router.delete('/events/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), deleteEvent);

router.get('/calendar', getEvents);
router.post('/calendar', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), createEvent);
router.put('/calendar/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), updateEvent);
router.delete('/calendar/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), deleteEvent);

// Hospital Events — managed by clinical admins
router.get('/hospital-events', getHospitalEvents);
router.post('/hospital-events', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), async (req, res) => {
  req.body.source = 'hospital';
  await createEvent(req, res);
});
router.put('/hospital-events/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), updateEvent);
router.delete('/hospital-events/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), deleteEvent);

// Admissions
router.get('/admissions', getAdmissions);
router.post('/admissions', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), createAdmission);
router.put('/admissions/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), updateAdmission);
router.delete('/admissions/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), deleteAdmission);

// Research
router.get('/research', getResearch);
router.post('/research', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), createResearch);
router.put('/research/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), updateResearch);
router.delete('/research/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), deleteResearch);

// Faculty
router.get('/faculty', getFaculty);
router.post('/faculty', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), createFaculty);
router.put('/faculty/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), updateFaculty);
router.delete('/faculty/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_COLLEGE'), deleteFaculty);

module.exports = router;
