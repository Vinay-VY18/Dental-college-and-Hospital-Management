const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Create Razorpay Order
router.post('/create-order', protect, paymentController.createOrder);

// Verify Payment
router.post('/verify-payment', protect, paymentController.verifyPayment);

// Get Razorpay Key
router.get('/razorpay-key', paymentController.getRazorpayKey);

// Get Payment History
router.get('/history/:studentId', protect, paymentController.getPaymentHistory);

// Handle Payment Failed
router.post('/payment-failed', protect, paymentController.handlePaymentFailed);

module.exports = router;
