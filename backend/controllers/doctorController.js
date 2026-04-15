const PGDoctor = require('../models/PGDoctor');

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await PGDoctor.find();
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addDoctor = async (req, res) => {
  try {
    const newDoctor = new PGDoctor(req.body);
    await newDoctor.save();
    res.status(201).json({ success: true, doctor: newDoctor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await PGDoctor.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await PGDoctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const toggleDoctorAvailability = async (req, res) => {
  try {
    const doctor = await PGDoctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    
    doctor.status = doctor.status === 'Available' ? 'Off-Duty' : 'Available';
    await doctor.save();

    if (req.io) {
      req.io.emit('doctorStatusUpdate', { id: doctor._id, status: doctor.status });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAllDoctors, addDoctor, updateDoctor, deleteDoctor, toggleDoctorAvailability };
