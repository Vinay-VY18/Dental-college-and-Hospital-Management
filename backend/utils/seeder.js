const Faculty = require('../models/Faculty');
const Research = require('../models/Research');
const Event = require('../models/Event');
const Admission = require('../models/Admission');
const Department = require('../models/Department');

const seedData = async () => {
  try {
    // 1. Seed Faculty if empty
    const facultyCount = await Faculty.countDocuments();
    if (facultyCount === 0) {
      await Faculty.create([
        { 
          name: "Dr. Rajkumar S.", 
          designation: "HOD & Professor", 
          department: "Oral Surgery", 
          experience: "22 Years", 
          specialization: "Maxillofacial Surgery, Zygomatic Implants"
        },
        { 
          name: "Dr. Shwetha G.", 
          designation: "Professor", 
          department: "Orthodontics", 
          experience: "15 Years", 
          specialization: "Invisalign, Clear Aligner Therapy"
        },
        { 
          name: "Dr. Naveen Kumar", 
          designation: "Associate Professor", 
          department: "Prosthodontics", 
          experience: "12 Years", 
          specialization: "Fixed Prosthodontics, Dental Implants"
        },
        { 
          name: "Dr. Preethi M.", 
          designation: "Assistant Professor", 
          department: "Pedodontics", 
          experience: "8 Years", 
          specialization: "Preventive Dentistry, Child Behavior Management"
        }
      ]);
      console.log('✅ Faculty seeded');
    }

    // 2. Seed Research if empty
    const researchCount = await Research.countDocuments();
    if (researchCount === 0) {
      await Research.create([
        { 
          title: "Oral Cancer Screening Trends", 
          authors: "Dr. Rajkumar S., Dr. Rahul M.", 
          description: "A comprehensive study on the success rate of zygomatic implants in severely resorbed maxilla."
        },
        { 
          title: "Pediatric Fluorosis Study", 
          authors: "Dr. Shwetha G., Dr. Ananya P.", 
          description: "Evaluating the precision of intraoral scanners vs conventional impressions."
        },
        { 
          title: "Digital Imaging in Orthodontics", 
          authors: "Dr. Naveen Kumar", 
          description: "A review of current trends in nanotechnology for dental materials."
        }
      ]);
      console.log('✅ Research seeded');
    }

    // 3. Seed Events if empty
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      await Event.create([
        { date: "15 May 2026", title: "National CDE Workshop", type: "Workshop" },
        { date: "22 June 2026", title: "Dental Camp at Kumbalgodu", type: "Social Service" },
        { date: "10 July 2026", title: "RRDCH Sports Meet", type: "Sports" }
      ]);
      console.log('✅ Events seeded');
    }

    // 4. Seed Admission/Courses if empty
    const admissionCount = await Admission.countDocuments();
    if (admissionCount === 0) {
      await Admission.create([
        { 
          department: "Undergraduate", 
          degree: "BDS", 
          totalSeats: 100, 
          availableSeats: 45, 
          eligibility: ["NEET Qualified", "10+2 with Physics, Chemistry, Biology"],
          feeStructure: { tuition: 550000, hostel: 120000 },
          active: true
        },
        { 
          department: "Postgraduate", 
          degree: "MDS", 
          totalSeats: 45, 
          availableSeats: 12, 
          eligibility: ["NEET MDS Qualified", "BDS Degree from recognized university"],
          feeStructure: { tuition: 850000, hostel: 150000 },
          active: true
        },
        {
          department: "Oral Surgery",
          degree: "MDS",
          totalSeats: 6,
          availableSeats: 2,
          eligibility: ["NEET MDS Rank < 500", "BDS completion with internship"],
          feeStructure: { tuition: 1200000, hostel: 150000 },
          active: true
        },
        {
          department: "Orthodontics",
          degree: "MDS",
          totalSeats: 6,
          availableSeats: 1,
          eligibility: ["NEET MDS Rank < 300", "BDS completion with internship"],
          feeStructure: { tuition: 1500000, hostel: 150000 },
          active: true
        },
        {
          department: "Prosthodontics",
          degree: "MDS",
          totalSeats: 6,
          availableSeats: 3,
          eligibility: ["NEET MDS Rank < 800", "BDS completion with internship"],
          feeStructure: { tuition: 1000000, hostel: 150000 },
          active: true
        },
        {
          department: "Periodontics",
          degree: "MDS",
          totalSeats: 4,
          availableSeats: 2,
          eligibility: ["NEET MDS Rank < 1200", "BDS completion with internship"],
          feeStructure: { tuition: 700000, hostel: 150000 },
          active: true
        },
        {
          department: "Conservative Dentistry",
          degree: "MDS",
          totalSeats: 6,
          availableSeats: 2,
          eligibility: ["NEET MDS Qualified", "BDS completion with internship"],
          feeStructure: { tuition: 1100000, hostel: 150000 },
          active: true
        },
        {
          department: "Oral Pathology",
          degree: "MDS",
          totalSeats: 3,
          availableSeats: 1,
          eligibility: ["NEET MDS Qualified", "BDS degree"],
          feeStructure: { tuition: 600000, hostel: 150000 },
          active: true
        },
        {
          department: "Public Health Dentistry",
          degree: "MDS",
          totalSeats: 3,
          availableSeats: 2,
          eligibility: ["NEET MDS Qualified", "BDS degree"],
          feeStructure: { tuition: 500000, hostel: 150000 },
          active: true
        },
        {
          department: "Pedodontics",
          degree: "MDS",
          totalSeats: 6,
          availableSeats: 3,
          eligibility: ["NEET MDS Qualified", "BDS degree"],
          feeStructure: { tuition: 900000, hostel: 150000 },
          active: true
        },
        {
          department: "Oral Medicine",
          degree: "MDS",
          totalSeats: 3,
          availableSeats: 1,
          eligibility: ["NEET MDS Qualified", "BDS degree"],
          feeStructure: { tuition: 550000, hostel: 150000 },
          active: true
        }
      ]);
      console.log('✅ Admission/Courses seeded');
    }

    // 5. Seed Departments if empty
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.create([
        { name: "Oral Surgery", description: "Specializing in surgical treatments of the mouth and jaw.", hod: "Dr. Rajkumar S.", facultyCount: 8 },
        { name: "Orthodontics", description: "Correcting misaligned teeth and jaws.", hod: "Dr. Shwetha G.", facultyCount: 6 },
        { name: "Prosthodontics", description: "Providing dental prostheses for missing teeth.", hod: "Dr. Naveen Kumar", facultyCount: 5 },
        { name: "Periodontics", description: "Treating gum diseases and dental implants.", hod: "Dr. Preethi M.", facultyCount: 4 }
      ]);
      console.log('✅ Departments seeded');
    }

  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
};

module.exports = seedData;
