const Complaint = require('../models/Complaint');

const submitComplaint = async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json({ success: true, complaint: newComplaint });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { submitComplaint, getComplaints };
