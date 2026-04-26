const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Student = require('./models/Student');

const seedStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rrdch');

    console.log('Connected to MongoDB');

    // Clear existing students
    await Student.deleteMany({});
    console.log('Cleared existing students');

    // Create dummy students
    const dummyStudents = [
      {
        usn: '1RV22XX001',
        name: 'Aarav Kumar',
        email: 'aarav@rrdch.edu',
        dateOfBirth: new Date('2002-05-15'),
        department: 'BDS',
        semester: 4,
        phone: '9876543210'
      },
      {
        usn: '1RV22XX002',
        name: 'Bhavna Sharma',
        email: 'bhavna@rrdch.edu',
        dateOfBirth: new Date('2002-08-22'),
        department: 'BDS',
        semester: 4,
        phone: '9876543211'
      },
      {
        usn: '1RV22XX003',
        name: 'Chitra Patel',
        email: 'chitra@rrdch.edu',
        dateOfBirth: new Date('2001-12-10'),
        department: 'MDS',
        semester: 2,
        phone: '9876543212'
      },
      {
        usn: '1RV21XX001',
        name: 'Dheeraj Singh',
        email: 'dheeraj@rrdch.edu',
        dateOfBirth: new Date('2001-03-18'),
        department: 'BDS',
        semester: 6,
        phone: '9876543213'
      },
      {
        usn: '1RV21XX002',
        name: 'Esha Gupta',
        email: 'esha@rrdch.edu',
        dateOfBirth: new Date('2000-07-25'),
        department: 'MDS',
        semester: 4,
        phone: '9876543214'
      }
    ];

    // Insert students one by one to trigger pre('save') hooks
    const students = [];
    for (const studentData of dummyStudents) {
      const student = new Student(studentData);
      await student.save();
      students.push(student);
    }
    console.log(`✓ Seeded ${students.length} dummy students`);

    console.log('\n--- Seeded Students ---');
    students.forEach((student) => {
      const dobStr = new Date(student.dateOfBirth).toISOString().split('T')[0];
      console.log(`USN: ${student.usn}, DOB: ${dobStr}, Name: ${student.name}, StudentID: ${student.studentId}`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Seed completed successfully');
  } catch (error) {
    console.error('Error seeding students:', error);
    process.exit(1);
  }
};

seedStudents();
