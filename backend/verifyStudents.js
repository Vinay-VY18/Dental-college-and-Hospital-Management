const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Student = require('./models/Student');

const verifyStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rrdch', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    // Check how many students exist
    const count = await Student.countDocuments();
    console.log(`Total students in database: ${count}\n`);

    if (count === 0) {
      console.log('⚠️  No students found! Run: npm run seed-students');
      await mongoose.connection.close();
      return;
    }

    // List all students
    console.log('--- Seeded Students ---\n');
    const students = await Student.find({}).select('-dateOfBirthHash');
    
    students.forEach((student, index) => {
      const dobDate = new Date(student.dateOfBirth);
      const dobStr = dobDate.getFullYear() + '-' + 
                     String(dobDate.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(dobDate.getDate()).padStart(2, '0');
      
      console.log(`${index + 1}. USN: ${student.usn}`);
      console.log(`   DOB: ${dobStr} (use this for login password)`);
      console.log(`   Name: ${student.name}`);
      console.log(`   StudentID: ${student.studentId}\n`);
    });

    await mongoose.connection.close();
    console.log('✓ Verification complete');
  } catch (error) {
    console.error('Error verifying students:', error);
    process.exit(1);
  }
};

verifyStudents();
