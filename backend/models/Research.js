const mongoose = require('mongoose');

const ResearchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, default: '' },
});

module.exports = mongoose.model('Research', ResearchSchema);
