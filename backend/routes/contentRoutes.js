const express = require('express');
const router = express.Router();
const {
  getSyllabus, getAdmissions, getResearch, getDepartments,
  createSyllabus, createAdmission, createResearch, createDepartment,
  updateSyllabus, updateAdmission, updateResearch, updateDepartment,
  deleteSyllabus, deleteAdmission, deleteResearch, deleteDepartment
} = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/syllabus', getSyllabus);
router.post('/syllabus', protect, authorize('ADMIN_ACADEMIC'), createSyllabus);
router.put('/syllabus/:id', protect, authorize('ADMIN_ACADEMIC'), updateSyllabus);
router.delete('/syllabus/:id', protect, authorize('ADMIN_ACADEMIC'), deleteSyllabus);

router.get('/admissions', getAdmissions);
router.post('/admissions', protect, authorize('ADMIN_COLLEGE'), createAdmission);
router.put('/admissions/:id', protect, authorize('ADMIN_COLLEGE'), updateAdmission);
router.delete('/admissions/:id', protect, authorize('ADMIN_COLLEGE'), deleteAdmission);

router.get('/research', getResearch);
router.post('/research', protect, authorize('ADMIN_COLLEGE'), createResearch);
router.put('/research/:id', protect, authorize('ADMIN_COLLEGE'), updateResearch);
router.delete('/research/:id', protect, authorize('ADMIN_COLLEGE'), deleteResearch);

router.get('/departments', getDepartments);
router.post('/departments', protect, authorize('ADMIN_ACADEMIC'), createDepartment);
router.put('/departments/:id', protect, authorize('ADMIN_ACADEMIC'), updateDepartment);
router.delete('/departments/:id', protect, authorize('ADMIN_ACADEMIC'), deleteDepartment);

module.exports = router;
