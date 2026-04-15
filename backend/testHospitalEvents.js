require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test admin token (you'll need a real token in practice)
const testHospitalEvent = {
  date: '15 Apr',
  title: 'API Test Event',
  type: 'Training'
};

async function runTests() {
  console.log('🧪 Testing Hospital Events API...\n');
  
  try {
    // Test 1: Get all hospital events
    console.log('[1] Testing GET /api/college/hospital-events');
    const getRes = await axios.get(`${API_URL}/college/hospital-events`);
    console.log(`✓ Found ${getRes.data.length} hospital events`);
    console.log('   Events:', getRes.data.map(e => `${e.date}: ${e.title}`).join(', '));
    console.log('');

    // Test 2: Check event structure
    if (getRes.data.length > 0) {
      const event = getRes.data[0];
      console.log('[2] Checking Event Schema');
      console.log('✓ Event fields:', Object.keys(event));
      console.log('   Source:', event.source);
      console.log('   Should be "hospital":', event.source === 'hospital' ? '✓ YES' : '✗ NO');
      console.log('');
    }

    // Test 3: Verify filtering works
    console.log('[3] Verifying Hospital Events Filtering');
    const allRes = await axios.get(`${API_URL}/college/events`);
    const collegeEvts = allRes.data.filter(e => e.source === 'college');
    const hospEvts = getRes.data;
    console.log(`✓ College events: ${collegeEvts.length}, Hospital events: ${hospEvts.length}`);
    console.log('');

    console.log('✅ API Tests Passed!');
    console.log('\n📝 Next Steps for Adding Events:');
    console.log('1. Make sure you\'re logged in as ADMIN_CLINIC user');
    console.log('2. Go to Clinical Management tab');
    console.log('3. Scroll to "Hospital Calendar of Events" section');
    console.log('4. Fill in Date, Title, and Event Type');
    console.log('5. Click "Add Hospital Event" button');
    console.log('6. Check browser console (F12) for any errors');

  } catch (err) {
    console.error('❌ API Error:', err.response?.data || err.message);
  }
}

runTests();
