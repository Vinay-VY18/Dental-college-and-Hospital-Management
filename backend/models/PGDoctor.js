const mongoose = require('mongoose');

const PGDoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  schedule: { type: String, required: true },
  status: { type: String, default: 'Available', enum: ['Available', 'Off-Duty'] }
});

module.exports = mongoose.model('PGDoctor', PGDoctorSchema);
