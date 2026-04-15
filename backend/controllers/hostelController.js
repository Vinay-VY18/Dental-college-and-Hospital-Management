const Complaint = require('../models/Complaint');

const addComplaint = async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });
    complaint.status = 'Solved';
    await complaint.save();
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOneAndDelete({ _id: req.params.id, status: 'Solved' });
    if (!complaint) return res.status(400).json({ success: false, message: 'Only Solved complaints can be deleted' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const editComplaintAdmin = async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, complaint: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { addComplaint, getComplaints, updateComplaintStatus, deleteComplaint, editComplaintAdmin };
