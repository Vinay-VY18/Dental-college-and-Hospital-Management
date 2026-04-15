const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  experience: { type: String },
  image: { type: String },
  specialization: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
