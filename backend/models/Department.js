const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  hod: { type: String, default: 'TBA' },
  facultyCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Department', DepartmentSchema);
