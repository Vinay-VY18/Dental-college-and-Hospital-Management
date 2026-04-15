const mongoose = require('mongoose');

const SyllabusSchema = new mongoose.Schema({
  year: { type: String, required: true },
  description: { type: String, required: true },
  fileLink: { type: String, default: '#' },
});

module.exports = mongoose.model('Syllabus', SyllabusSchema);
