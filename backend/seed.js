require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to Atlas for seeding...');
  await Admin.deleteMany({});
  
  const admins = [
    { username: 'admin', password: 'password123', role: 'SUPER_ADMIN' },
    { username: 'clinic_admin', password: 'password123', role: 'ADMIN_CLINIC' },
    { username: 'academic_admin', password: 'password123', role: 'ADMIN_ACADEMIC' },
    { username: 'college_admin', password: 'password123', role: 'ADMIN_COLLEGE' },
    { username: 'hostel_admin', password: 'password123', role: 'ADMIN_HOSTEL' }
  ];

  for (const adminData of admins) {
    const admin = new Admin(adminData);
    await admin.save();
  }
  
  console.log('All Role-based Admins seeded successfully to Atlas!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
