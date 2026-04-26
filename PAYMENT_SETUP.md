# Razorpay Payment Integration Setup Guide

## ✅ Implementation Complete

The Razorpay payment system has been fully integrated with test credentials for development.

### Test Credentials

**Razorpay Test Mode:**
- Key ID: `rzp_test_1JuMKjmVzrT87p`
- Key Secret: `ZdhEUskgr0t32aX9xj8y1Yzk`
- Already configured in `.env` file

### Test Payment Details

Use these test card details to test payments:

**Successful Payment:**
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- OTP: 123456

**Failed Payment:**
- Card Number: 4222 2222 2222 2200
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: 123456

### Backend API Endpoints

```
POST   /api/payments/create-order      - Create payment order
POST   /api/payments/verify-payment    - Verify payment signature
GET    /api/payments/razorpay-key      - Get Razorpay key
GET    /api/payments/history/:studentId - Get payment history
POST   /api/payments/payment-failed    - Handle failed payments
```

### Database Models

**Payment Schema:**
- studentId: Reference to Student
- razorpayOrderId: Order ID from Razorpay
- razorpayPaymentId: Payment ID from Razorpay
- razorpaySignature: Payment signature
- amount: Payment amount
- currency: Currency (default: INR)
- status: pending | success | failed
- description: Payment description
- createdAt: Timestamp

### Frontend Integration

**Fee Status Display:**
- Total Fee: ₹73,000
- Paid Fee: ₹30,000 (configurable)
- Balance Fee: ₹43,000 (auto-calculated)

**Payment Flow:**
1. Student clicks "Pay Now" button
2. Backend creates Razorpay order
3. Razorpay checkout opens
4. Payment is processed
5. Backend verifies signature
6. Receipt is generated & displayed
7. Receipt can be downloaded

### How to Deploy to Production

1. **Create Live Razorpay Account:**
   - Visit https://dashboard.razorpay.com
   - Get live credentials

2. **Update Environment Variables:**
   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxx
   ```

3. **No code changes needed** - Razorpay integration will automatically work with live credentials

### Security Features

- ✅ Signature verification for all payments
- ✅ JWT authentication for payment endpoints
- ✅ Order creation with unique receipt numbers
- ✅ Payment status tracking in database
- ✅ Error handling and logging

### Files Created/Modified

**Backend:**
- `/backend/models/Payment.js` - Payment schema
- `/backend/controllers/paymentController.js` - Payment logic
- `/backend/routes/paymentRoutes.js` - API endpoints
- `/backend/server.js` - Added payment routes
- `/backend/package.json` - Added razorpay dependency
- `/backend/.env` - Added Razorpay test credentials

**Frontend:**
- `/frontend/src/pages/StudentDashboard.jsx` - Updated payment integration
- `/frontend/index.html` - Added Razorpay script

### Troubleshooting

**401 Unauthorized Error:**
- Ensure Razorpay credentials in `.env` are correct
- Restart backend server after updating .env

**Payment Modal Not Opening:**
- Check browser console for errors
- Ensure Razorpay script is loaded
- Verify JWT token is valid

**Signature Verification Failed:**
- Check that order ID and payment ID match
- Verify RAZORPAY_KEY_SECRET is correct
- Ensure client is sending correct data

### Next Steps

1. Test with test credentials
2. Verify all payment flows work
3. Set up production Razorpay account
4. Update environment variables with live credentials
5. Test with live payments (optional - low amount)
