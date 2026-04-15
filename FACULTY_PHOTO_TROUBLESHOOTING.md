# Faculty Photo Upload - Troubleshooting Guide

## ✅ Updated Features (April 15, 2026)
- **Image Compression**: Photos automatically resized to 800x800px max and compressed to 80% JPEG quality
- **File Validation**: Accepts only image files (JPG, PNG, etc.)
- **Size Limit**: Max 5MB file size
- **Instant Preview**: See compressed photo before uploading

## Step-by-Step Instructions

### 1. Navigate to Faculty Directory Manager
- Go to **College Management** tab
- Scroll down to **Faculty Directory Manager** section

### 2. Fill Faculty Details
```
Full Name: Dr. Rajiv Kumar
Designation: Professor
Department: Oral Surgery (select from dropdown)
Experience: 15 years
Specialization: Oral Maxillofacial Surgery
```

### 3. Upload Photo
- Click **"Faculty Photo"** file upload button
- Select an image from your computer (JPG, PNG recommended)
- Wait 2-3 seconds for compression
- **You should see a preview thumbnail** showing the compressed image

### 4. Publish
- Click **"Publish to College Site"** button
- Wait for success alert
- Photo will appear in faculty list

## ❌ If It's Still Not Working

### Issue 1: Preview Not Showing
**Error**: Selected photo but no preview appears

**Solution**:
1. Hard refresh browser: **Ctrl+Shift+R**
2. Make sure image file is less than 5MB
3. Try a different image (PNG or JPG)
4. Check browser console (F12 → Console tab) for errors

### Issue 2: Upload Fails with Error
**Error**: "Failed to add: ..." message appears

**Solutions**:
1. **Check file format**: Use JPG or PNG (not animated GIF, WebP)
2. **Check file size**: Should be less than 5MB
3. **Check connection**: Make sure backend is running on port 5000
4. **Clear data**: 
   - Open browser console (F12)
   - Run: `sessionStorage.clear()`
   - Refresh page and try again

### Issue 3: Preview Shows But Upload Still Fails
**Symptoms**: Image preview visible but clicking submit shows error

**Solutions**:
1. **Verify backend is running**:
   ```powershell
   cd backend
   npm start
   ```
   Should see: "Server running on port 5000"

2. **Check database connection**:
   - Backend should show "Connected to MongoDB"
   - If not, verify `.env` has correct `MONGO_URI`

3. **Check MongoDB size limit**:
   - Compressed images should be 50-200KB
   - If seeing "document too large" error, try:
     - Selecting smaller/lower quality photo
     - System will compress it further

### Issue 4: Photo Doesn't Display on College Website
**Symptoms**: Published successfully but photo missing from faculty list

**File Paths to Check**:
- Frontend displays in: `frontend/src/pages/admin/AdminDashboard.jsx` (line ~825)
- Public displays in: College website (check `/pages/` for any faculty display page)

**Solution**:
1. Refresh webpage multiple times
2. Hard refresh: **Ctrl+Shift+R**
3. Clear browser cache (Ctrl+Shift+Delete)
4. Make sure you're ADMIN_COLLEGE role logged in

## 🔍 Debug Checklist

- [ ] Backend running? (port 5000)
- [ ] MongoDB connected?
- [ ] File less than 5MB?
- [ ] File is JPG/PNG format?
- [ ] Preview showing after upload?
- [ ] Error message in browser console? (F12)
- [ ] Admin logged in as ADMIN_COLLEGE?
- [ ] All form fields filled (Name, Designation, Dept, Experience, Specialization)?

## 📊 Image Specifications

| Property | Requirement |
|----------|-------------|
| Format | JPG, PNG |
| Max Size (Original) | 5 MB |
| Max Dimensions | 800x800 px |
| Compression | 80% JPEG quality |
| Compressed Size | ~50-200 KB |
| Storage | MongoDB (Base64) |

## ✅ Expected Behavior

1. Select photo → **Preview appears in 2-3 sec**
2. Click publish → **Success alert + photo appears in list**
3. Reload page → **Photo still there**
4. Check college website faculty section → **Photo displays**

## 🚀 Performance Tips

- Use JPG format (smaller than PNG)
- Pre-crop photo to square (for better preview)
- Use 800x800px or smaller original image
- Avoid animated GIFs or WebP format

## Questions or Issues?

Check the following files for more context:
- `AdminDashboard.jsx` - Frontend form (line 845-875)
- `Faculty.js` (model) - Database schema
- `contentController.js` - Upload handler
- Browser console (F12) - Error details

---
**Last Updated**: April 15, 2026
**Image Compression**: Canvas API (built-in browser)
**Database**: MongoDB
