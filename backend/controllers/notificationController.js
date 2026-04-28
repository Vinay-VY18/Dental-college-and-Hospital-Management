const Subscription = require('../models/Subscription');

exports.getVapidKey = (req, res) => {
  res.status(200).json({ key: process.env.VAPID_PUBLIC_KEY });
};

exports.subscribe = async (req, res) => {
  try {
    const { subscription, trackingId, department } = req.body;
    const patientId = req.patient._id || req.patient.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: 'Missing subscription object' });
    }

    // Keep only one subscription per device endpoint to avoid duplicate/wrong notifications across accounts
    if (subscription.endpoint) {
      await Subscription.deleteMany({
        'subscription.endpoint': subscription.endpoint,
        patient: { $ne: patientId }
      });
    }

    // Check if subscription already exists for this patient
    let sub = await Subscription.findOne({ patient: patientId });
    if (sub) {
      sub.subscription = subscription;
      if (trackingId) sub.trackingId = trackingId;
      if (department) sub.department = department;
      await sub.save();
    } else {
      sub = new Subscription({
        patient: patientId,
        trackingId: trackingId || 'Global',
        department: department || 'Any',
        subscription
      });
      await sub.save();
    }

    res.status(201).json({ success: true, message: 'Subscription added successfully.' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ success: false, message: 'Server error saving subscription.' });
  }
};

exports.testNotification = async (req, res) => {
  try {
    const patientId = req.patient._id || req.patient.id;
    const sub = await Subscription.findOne({ patient: patientId });
    if (!sub || !sub.subscription) {
      return res.status(404).json({ success: false, message: 'No active push subscription found to test.' });
    }

    const webpush = require('web-push');
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@rrdch.edu.in',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({
      title: 'Success! Web Push is working.',
      body: 'Your RRDCH patient alert system is successfully connected and receiving messages.'
    });

    await webpush.sendNotification(sub.subscription, payload);
    res.json({ success: true, message: 'Test notification fired.' });
  } catch (error) {
    console.error('Test Push error:', error);
    res.status(500).json({ success: false, message: 'Failed to send test push notification.' });
  }
};

exports.broadcastMessage = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // Emit via Socket.IO
    req.io.emit('adminBroadcast', { title, message });

    res.json({ success: true, message: 'Broadcast sent successfully via Socket.IO' });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast message.' });
  }
};
