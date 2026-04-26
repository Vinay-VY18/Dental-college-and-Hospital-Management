const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Register a new student
exports.registerStudent = async (req, res) => {
  try {
    const { usn, name, email, dateOfBirth, department, semester, phone } = req.body;

    // Validate required fields
    if (!usn || !name || !dateOfBirth) {
      return res.status(400).json({ message: 'USN, name, and date of birth are required' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ $or: [{ usn: usn.toUpperCase() }, { email }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this USN or email already exists' });
    }

    // Create new student
    const student = new Student({
      usn: usn.toUpperCase(),
      name,
      email,
      dateOfBirth: new Date(dateOfBirth),
      department,
      semester,
      phone
    });

    await student.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, usn: student.usn },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      student: {
        studentId: student.studentId,
        usn: student.usn,
        name: student.name,
        email: student.email,
        department: student.department,
        semester: student.semester
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering student', error: error.message });
  }
};

// Login student with USN and DOB
exports.loginStudent = async (req, res) => {
  try {
    const { usn, dateOfBirth } = req.body;

    if (!usn || !dateOfBirth) {
      return res.status(400).json({ message: 'USN and date of birth are required' });
    }

    // Find student by USN
    const student = await Student.findOne({ usn: usn.toUpperCase() }).select('+dateOfBirthHash');

    if (!student) {
      console.log(`Student not found with USN: ${usn.toUpperCase()}`);
      return res.status(401).json({ message: 'Invalid USN or date of birth' });
    }

    // Verify date of birth
    const isValidDob = await student.matchDateOfBirth(dateOfBirth);

    if (!isValidDob) {
      console.log(`Invalid DOB for student ${usn.toUpperCase()}`);
      return res.status(401).json({ message: 'Invalid USN or date of birth' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, usn: student.usn },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      student: {
        studentId: student.studentId,
        usn: student.usn,
        name: student.name,
        email: student.email,
        department: student.department,
        semester: student.semester
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get student profile
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      student: {
        studentId: student.studentId,
        usn: student.usn,
        name: student.name,
        email: student.email,
        dateOfBirth: student.dateOfBirth,
        department: student.department,
        semester: student.semester,
        phone: student.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const { name, email, phone, department, semester } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, department, semester },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      student: {
        studentId: student.studentId,
        usn: student.usn,
        name: student.name,
        email: student.email,
        department: student.department,
        semester: student.semester
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
