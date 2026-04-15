const express = require('express');
const router = express.Router();
const { getAllDoctors, addDoctor, updateDoctor, deleteDoctor, toggleDoctorAvailability } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllDoctors);
router.post('/', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), addDoctor);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), updateDoctor);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), deleteDoctor);
router.put('/:id/toggle', protect, authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), toggleDoctorAvailability);

module.exports = router;

module.exports = router;
