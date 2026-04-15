const Event = require('../models/Event');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ source: 'college' }).sort({ _id: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error in getEvents:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getHospitalEvents = async (req, res) => {
  try {
    const events = await Event.find({ source: 'hospital' }).sort({ _id: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error in getHospitalEvents:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { date, title, type, source = 'college' } = req.body;
    if (!date || !title || !type) {
      return res.status(400).json({ 
        success: false, 
        error: `Missing required fields. Received: date="${date}", title="${title}", type="${type}"` 
      });
    }
    const event = new Event({ date, title, type, source });
    await event.save();
    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Error in createEvent:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { getEvents, getHospitalEvents, createEvent, updateEvent, deleteEvent };
