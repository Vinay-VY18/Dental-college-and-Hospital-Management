const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, description, studentId, receipt } = req.body;

    console.log('Payment Order Request:', { amount, description, studentId, receipt });

    // Validate amount
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ message: 'Valid amount is required', success: false });
    }

    // Validate studentId
    if (!studentId) {
      console.error('Missing studentId');
      return res.status(400).json({ message: 'Student ID is required', success: false });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      description: description || 'Fee Payment',
      notes: {
        studentId: studentId
      }
    };

    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);

    // Save payment record in database
    const payment = new Payment({
      studentId,
      razorpayOrderId: order.id,
      amount,
      status: 'pending',
      description,
      receipt: order.receipt,
      notes: order.notes
    });

    await payment.save();
    console.log('Payment record saved:', payment._id);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Failed to create payment order',
      error: error.message,
      success: false
    });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: 'Missing required payment verification fields'
      });
    }

    // Verify signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({
        message: 'Payment verification failed - Invalid signature',
        success: false
      });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'success',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        message: 'Payment record not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        razorpayPaymentId,
        razorpayOrderId: razorpay_order_id,
        amount: payment.amount,
        status: 'success',
        date: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      message: 'Payment verification failed',
      error: error.message,
      success: false
    });
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const payments = await Payment.find({ studentId })
      .sort({ createdAt: -1 })
      .select('razorpayPaymentId amount status createdAt description');

    const successfulPayments = payments.filter(p => p.status === 'success');
    const totalPaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      totalPaid,
      paymentCount: successfulPayments.length,
      payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// Get Razorpay Key
exports.getRazorpayKey = async (req, res) => {
  try {
    res.json({
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch Razorpay key',
      error: error.message
    });
  }
};

// Payment Failed
exports.handlePaymentFailed = async (req, res) => {
  try {
    const { razorpay_order_id, error } = req.body;

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed', updatedAt: new Date() }
    );

    res.json({
      success: false,
      message: 'Payment failed',
      error: error
    });
  } catch (err) {
    console.error('Error handling payment failure:', err);
    res.status(500).json({
      message: 'Failed to process payment failure',
      error: err.message
    });
  }
};
