# Quick Guide - Forgot Password Feature

## For Patients: How to Reset Your Password

### If You Forgot Your Hospital Portal Password:

1. **Go to Login Page** → `http://localhost:5174/hospital-auth`

2. **Click "Forgot Password?"** (blue link below password field)

3. **Enter Your Info:**
   - Patient ID: `RRDCHP...` (from your hospital ID)
   - **OR** Phone Number: Your registered phone

4. **Click "Verify"** → System checks if you're registered

5. **Enter New Password:**
   - Minimum 6 characters
   - Confirm password again
   - Click "Reset Password"

6. **Success!** → Login with your new password

---

## For Developers: Technical Summary

### Frontend Implementation:
- ✅ "Forgot Password?" link in login form
- ✅ Modal with 2-step process
- ✅ English & Kannada support
- ✅ Client-side validation

### Backend Implementation:
- ✅ `POST /api/patients/verify-identity` - Verify patient
- ✅ `POST /api/patients/reset-password` - Reset password
- ✅ Database password update
- ✅ Error handling

### Files Modified:
```
frontend/src/pages/HospitalAuth.jsx
backend/controllers/patientController.js
backend/routes/patientRoutes.js
```

---

## Testing the Feature

### Test Case 1: Valid Patient (Phone)
```
Input: 9876543210
Expected: Proceed to password reset
Result: ✅
```

### Test Case 2: Valid Patient (ID)
```
Input: RRDCHP001
Expected: Proceed to password reset
Result: ✅
```

### Test Case 3: Invalid Patient
```
Input: 0000000000 or INVALID
Expected: Error "Patient account not found"
Result: ✅
```

### Test Case 4: Password Reset
```
Input: NewPass123 (both fields)
Expected: Success, can login with new password
Result: ✅
```

---

## Key Features

| Feature | Status |
|---------|--------|
| Forgot Password Link | ✅ |
| Identity Verification | ✅ |
| Password Reset Form | ✅ |
| Multi-language | ✅ |
| Error Handling | ✅ |
| Security | ✅ |
| Mobile-Friendly | ✅ |

---

## Support

**Issue:** Patient ID format?  
**Answer:** Format is `RRDCHP` followed by numbers, e.g., `RRDCHP001`

**Issue:** Can't find Patient ID?  
**Answer:** It's printed on your hospital ID card

**Issue:** Forgot phone number too?  
**Answer:** Call support: 080-XXXX-XXXX

---

**Status:** Ready for production  
**Last Updated:** April 25, 2026
