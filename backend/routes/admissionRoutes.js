const express = require('express');
const router = express.Router();
const {
	getAdmissionByDept,
	getAdmissions,
	createAdmission,
	updateAdmission,
	deleteAdmission
} = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAdmissions);
router.get('/:dept', getAdmissionByDept);
router.post('/', protect, authorize('SUPER_ADMIN', 'ADMIN_ACADEMIC', 'ADMIN_COLLEGE'), createAdmission);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_ACADEMIC', 'ADMIN_COLLEGE'), updateAdmission);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_ACADEMIC', 'ADMIN_COLLEGE'), deleteAdmission);

module.exports = router;
