require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to Atlas for seeding hospital events...');
  
  const hospitalEvents = [
    { date: '18 Apr', title: 'Dental Health Awareness Camp', type: 'OutreachCamp', source: 'hospital' },
    { date: '20 Apr', title: 'Staff CPD Training - Latest Implant Techniques', type: 'Training', source: 'hospital' },
    { date: '22 Apr', title: 'Clinical Workshop on Smile Makeovers', type: 'ClinicalWorkshop', source: 'hospital' },
    { date: '25 Apr', title: 'Community Oral Hygiene Program', type: 'CommunityProgram', source: 'hospital' },
    { date: '28 Apr', title: 'Hospital Annual Dental Checkup Drive', type: 'OutreachCamp', source: 'hospital' },
    { date: '30 Apr', title: 'Advanced Restorative Dentistry Workshop', type: 'ClinicalWorkshop', source: 'hospital' },
    { date: '02 May', title: 'Staff Wellness Program', type: 'HospitalEvent', source: 'hospital' },
    { date: '05 May', title: 'Free Dental Screening - Old Age Home', type: 'CommunityProgram', source: 'hospital' }
  ];

  // Clear existing hospital events
  await Event.deleteMany({ source: 'hospital' });

  // Insert new hospital events
  await Event.insertMany(hospitalEvents);
  
  console.log(`✓ ${hospitalEvents.length} hospital events seeded successfully!`);
  console.log('Hospital events:');
  hospitalEvents.forEach(evt => console.log(`  - ${evt.date}: ${evt.title}`));
  
  process.exit(0);
}).catch(err => {
  console.error('Error seeding hospital events:', err);
  process.exit(1);
});
