const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  trackingId: { type: String, required: false },
  department: { type: String, required: false },
  subscription: { type: Object, required: true }, // endpoint, keys
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
