const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, getStudentProfile, updateStudentProfile } = require('../controllers/studentController');
const { protectStudent } = require('../middleware/auth');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/profile', protectStudent, getStudentProfile);
router.put('/profile', protectStudent, updateStudentProfile);

module.exports = router;
