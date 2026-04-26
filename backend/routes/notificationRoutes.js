const express = require('express');
const router = express.Router();
const { subscribe, getVapidKey, testNotification, broadcastMessage } = require('../controllers/notificationController');
const { protectPatient, protect, authorize } = require('../middleware/auth');

router.get('/vapidPublicKey', getVapidKey);
router.post('/subscribe', protectPatient, subscribe);
router.post('/test', protectPatient, testNotification);
router.post('/broadcast', protect, authorize('SUPER_ADMIN', 'GLOBAL_ADMIN', 'ADMIN_CLINIC'), broadcastMessage);

module.exports = router;
