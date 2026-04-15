const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema({
  department: { type: String, required: true },
  degree: { type: String, required: true, enum: ['BDS', 'MDS'] },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  eligibility: [{ type: String }],
  feeStructure: {
    tuition: { type: Number },
    hostel: { type: Number }
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Admission', AdmissionSchema);
