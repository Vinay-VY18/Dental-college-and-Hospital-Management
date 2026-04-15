const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, selectedRole } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (admin && (await admin.matchPassword(password))) {
      if (selectedRole && admin.role !== 'SUPER_ADMIN' && admin.role !== selectedRole) {
          return res.status(403).json({ message: 'Role mismatch. You are not authorized for this portal.' });
      }

      res.json({
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        token: jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' })
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
