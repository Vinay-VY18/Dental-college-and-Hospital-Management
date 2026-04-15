const express = require('express');
const router = express.Router();
const { submitComplaint, getComplaints } = require('../controllers/utilityController');

router.post('/complaint', submitComplaint);
router.get('/complaints', getComplaints);

module.exports = router;
