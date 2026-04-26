const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('./Counter');

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6, select: false },
  language: { type: String, enum: ['EN', 'KN'], default: 'EN' },
  createdAt: { type: Date, default: Date.now }
});

PatientSchema.pre('validate', async function () {
  if (this.patientId) return;

  const counter = await Counter.findOneAndUpdate(
    { _id: 'PATIENT_ID' },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  );

  this.patientId = `RRDCHP${String(counter.seq).padStart(5, '0')}`;
});

PatientSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

PatientSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Patient', PatientSchema);
