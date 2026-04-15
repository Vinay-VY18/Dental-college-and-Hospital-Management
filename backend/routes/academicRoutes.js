const express = require('express');
const router = express.Router();
const {
  getSyllabus, getDepartments, createSyllabus, createDepartment, updateSyllabus, updateDepartment, deleteSyllabus, deleteDepartment
} = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/syllabus', getSyllabus);
router.post('/syllabus', protect, authorize('SUPER_ADMIN', 'ADMIN_ACADEMIC'), createSyllabus);
router.put('/syllabus/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_ACADEMIC'), updateSyllabus);
router.delete('/syllabus/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_ACADEMIC'), deleteSyllabus);

router.get('/departments', getDepartments);
router.post('/departments', protect, authorize('SUPER_ADMIN', 'ADMIN_ACADEMIC'), createDepartment);
router.put('/departments/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_ACADEMIC'), updateDepartment);
router.delete('/departments/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_ACADEMIC'), deleteDepartment);

module.exports = router;
