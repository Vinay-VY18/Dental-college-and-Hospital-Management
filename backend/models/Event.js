const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  date: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  source: { type: String, enum: ['college', 'hospital'], required: true, default: 'college' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
