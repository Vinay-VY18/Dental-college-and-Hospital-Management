const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('./Counter');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, sparse: true },
  usn: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  dateOfBirthHash: { type: String, select: false },
  department: { type: String },
  semester: { type: Number },
  phone: { type: String, sparse: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

StudentSchema.pre('save', async function () {
  // Generate studentId if not already set
  if (!this.studentId) {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'STUDENT_ID' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
    this.studentId = `RRDCHS${String(counter.seq).padStart(5, '0')}`;
  }

  // Hash DOB if it's new or modified
  if (this.isNew || this.isModified('dateOfBirth')) {
    const salt = await bcrypt.genSalt(10);
    // Extract just the date part without time/timezone
    const dobDate = new Date(this.dateOfBirth);
    const dobString = dobDate.getFullYear() + '-' + 
                      String(dobDate.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(dobDate.getDate()).padStart(2, '0');
    this.dateOfBirthHash = await bcrypt.hash(dobString, salt);
  }
});

// Method to verify DOB password
StudentSchema.methods.matchDateOfBirth = async function (enteredDob) {
  if (!this.dateOfBirthHash) return false;
  // Format entered DOB to match YYYY-MM-DD
  const dobDate = new Date(enteredDob);
  const dobString = dobDate.getFullYear() + '-' + 
                    String(dobDate.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(dobDate.getDate()).padStart(2, '0');
  return bcrypt.compare(dobString, this.dateOfBirthHash);
};

module.exports = mongoose.model('Student', StudentSchema);
