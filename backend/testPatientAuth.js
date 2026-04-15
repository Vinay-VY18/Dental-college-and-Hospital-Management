const http = require('http');

function makeRequest(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint.startsWith('/') ? endpoint :`/api/patients${endpoint}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log(`Making ${method} request to ${options.path}`);

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testPatientAuth() {
  try {
    console.log('\n✅ PATIENT AUTHENTICATION & BOOKING TEST\n');

    // Test 1: Register a patient
    console.log('=== TEST 1: REGISTER ===');
    const registerRes = await makeRequest('POST', '/api/patients/register', {
      name: 'New Test Patient',
      phone: '7777777777',
      password: 'test123'
    });
    console.log('Status:', registerRes.status);
    if (registerRes.status === 201) {
      console.log('✓ Registration successful\n');
    } else {
      console.log('Response:', registerRes.data, '\n');
    }

    // Test 2: Login with the registered account
    console.log('=== TEST 2: LOGIN ===');
    const loginRes = await makeRequest('POST', '/api/patients/login', {
      phone: '7777777777',
      password: 'test123'
    });
    console.log('Status:', loginRes.status);
    if (loginRes.status === 200) {
      console.log('✓ Login successful\n');
    } else {
      console.log('Response:', loginRes.data, '\n');
    }

    // Test 3: Check availability for General Checkup (has available doctor)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    console.log('=== TEST 3: CHECK AVAILABILITY FOR GENERAL CHECKUP ===');
    const availRes = await makeRequest('GET', `/api/patients/booking-availability?department=${encodeURIComponent('General Checkup')}&date=${dateStr}`, null);
    console.log('Status:', availRes.status);
    console.log('Availability Detail:', {
      dayName: availRes.data.dayName,
      isPublicHoliday: availRes.data.isPublicHoliday,
      availableSlots: availRes.data.availableSlots?.length || 0,
      doctorCount: availRes.data.doctors?.length || 0
    }, '\n');

    // Test 4: Book an appointment with correct department
    console.log('=== TEST 4: BOOK APPOINTMENT (General Checkup) ===');
    if (availRes.data.availableSlots && availRes.data.availableSlots.length > 0) {
      const bookRes = await makeRequest('POST', '/api/patients/book', {
        name: 'New Test Patient',
        phone: '7777777777',
        department: 'General Checkup',
        date: dateStr,
        time: availRes.data.availableSlots[0]
      });
      console.log('Status:', bookRes.status);
      if (bookRes.status === 201) {
        console.log('✓ BOOKING SUCCESSFUL!');
        console.log('  Tracking ID:', bookRes.data.trackingId);
        console.log('  Token Number:', bookRes.data.tokenNumber);
        console.log('  Doctor:', bookRes.data.assignedDoctor?.name, '\n');
      } else {
        console.log('✗ Booking failed:', bookRes.data.message, '\n');
      }
    } else {
      console.log('✗ No available slots for General Checkup\n');
    }

    // Test 5: Try booking with Prosthodontics
    console.log('=== TEST 5: BOOK APPOINTMENT (Prosthodontics) ===');
    const availRes2 = await makeRequest('GET', `/api/patients/booking-availability?department=${encodeURIComponent('Prosthodontics')}&date=${dateStr}`, null);
    if (availRes2.data.availableSlots && availRes2.data.availableSlots.length > 0) {
      const bookRes2 = await makeRequest('POST', '/api/patients/book', {
        name: 'New Test Patient',
        phone: '7777777777',
        department: 'Prosthodontics',
        date: dateStr,
        time: availRes2.data.availableSlots[0]
      });
      console.log('Status:', bookRes2.status);
      if (bookRes2.status === 201) {
        console.log('✓ BOOKING SUCCESSFUL!');
        console.log('  Tracking ID:', bookRes2.data.trackingId);
        console.log('  Token Number:', bookRes2.data.tokenNumber);
        console.log('  Doctor:', bookRes2.data.assignedDoctor?.name, '\n');
      } else {
        console.log('✗ Booking failed:', bookRes2.data.message, '\n');
      }
    }

  } catch (error) {
    console.error('✗ Error:', error);
  }
}

// Run tests
setTimeout(() => {
  testPatientAuth();
}, 2000);
