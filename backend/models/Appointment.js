const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  department: { type: String, required: true },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'PGDoctor', default: null },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  tokenNumber: { type: Number },
  trackingId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Pending', 'In-Treatment', 'Completed', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
