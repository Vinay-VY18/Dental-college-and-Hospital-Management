const Syllabus = require('../models/Syllabus');
const Admission = require('../models/Admission');
const Research = require('../models/Research');
const Department = require('../models/Department');
const Event = require('../models/Event');

const getSyllabus = async (req, res) => {
  const data = await Syllabus.find({});
  res.json(data);
};

const getAdmissions = async (req, res) => {
  const data = await Admission.find({});
  res.json(data);
};

const getAdmissionByDept = async (req, res) => {
  try {
    const data = await Admission.find({ department: req.params.dept, active: true })
      .sort({ degree: 1, createdAt: -1 });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getResearch = async (req, res) => {
  const data = await Research.find({});
  res.json(data);
};

const getDepartments = async (req, res) => {
  const data = await Department.find({});
  res.json(data);
};

const Faculty = require('../models/Faculty');
const getFaculty = async (req, res) => {
  const data = await Faculty.find({});
  res.json(data);
};

// Admin Protected Actions
const createSyllabus = async (req, res) => {
  const item = await Syllabus.create(req.body);
  res.status(201).json(item);
};

const createAdmission = async (req, res) => {
  const item = await Admission.create(req.body);
  res.status(201).json(item);
};

const createResearch = async (req, res) => {
  const item = await Research.create(req.body);
  res.status(201).json(item);
};

const createDepartment = async (req, res) => {
  const item = await Department.create(req.body);
  res.status(201).json(item);
};

// Generic delete function
const deleteItem = (Model) => async (req, res) => {
  await Model.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// Generic update function
const updateItem = (Model) => async (req, res) => {
  const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
  res.json(updatedItem);
};

module.exports = {
  getSyllabus, getAdmissions, getAdmissionByDept, getResearch, getDepartments,
  createSyllabus, createAdmission, createResearch, createDepartment,
  updateSyllabus: updateItem(Syllabus),
  updateAdmission: updateItem(Admission),
  updateResearch: updateItem(Research),
  updateDepartment: updateItem(Department),
  deleteSyllabus: deleteItem(Syllabus),
  deleteAdmission: deleteItem(Admission),
  deleteResearch: deleteItem(Research),
  deleteDepartment: deleteItem(Department),
  updateEvent: updateItem(Event),
  deleteEvent: deleteItem(Event),
  getFaculty,
  createFaculty: async (req, res) => {
    const item = await Faculty.create(req.body);
    res.status(201).json(item);
  },
  updateFaculty: updateItem(Faculty),
  deleteFaculty: deleteItem(Faculty)
};
