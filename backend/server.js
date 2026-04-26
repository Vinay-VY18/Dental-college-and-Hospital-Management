const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Pass io to req so controllers can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const utilityRoutes = require('./routes/utilityRoutes');
const academicRoutes = require('./routes/academicRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const studentRoutes = require('./routes/studentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const seedData = require('./utils/seeder');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/utilities', utilityRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Fix 404 mock route for college events
app.get('/api/college/events', (req, res) => res.json({ success: true, events: [] }));

app.use('/api', hostelRoutes); // Mount general /api last

// --- Socket.IO Implementation for Live Queue ---
io.on('connection', async (socket) => {
  console.log('A user connected: ', socket.id);
  
  // When client requests queue status for a department
  socket.on('requestQueueStatus', async (department) => {
    try {
      const Appointment = require('./models/Appointment');
      const todayStr = new Date().toISOString().split('T')[0];
      const start = new Date(todayStr);
      const end = new Date(todayStr);
      end.setDate(end.getDate() + 1);

      const inTreatment = await Appointment.findOne({
        department,
        date: { $gte: start, $lt: end },
        status: 'In-Treatment'
      });

      const waitingCount = await Appointment.countDocuments({
        department,
        date: { $gte: start, $lt: end },
        status: 'Pending'
      });

      socket.emit('queueUpdate', {
        department,
        currentToken: inTreatment ? inTreatment.tokenNumber : '---',
        waitingCount,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error fetching queue status:', error);
      socket.emit('queueError', { message: 'Failed to fetch queue status' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
  });
});

// Placeholder for routes
app.get('/api/health', (req, res) => {
    res.json({ message: 'RRDCH backend is running normally' });
});

const connectDatabase = async () => {
    try {
        // First try to connect to configured MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rrdch', {
            serverSelectionTimeoutMS: 5000, // Quick timeout
        });
        console.log('✓ Connected to MongoDB');
        seedData(); // Populate dummy data if empty
    } catch (mainErr) {
        console.warn('⚠ Primary MongoDB connection failed, trying memory server...');
        try {
            // Fallback to in-memory MongoDB for development
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            
            await mongoose.connect(mongoUri);
            console.log('✓ Connected to MongoDB Memory Server (Development Mode)');
            console.log('⚠ Using in-memory database - data will be lost on restart');
            seedData(); // Populate dummy data
        } catch (fallbackErr) {
            console.error('✗ Both connection methods failed:', mainErr.message);
            console.error('Please ensure MongoDB is running or mongodb-memory-server is installed');
            process.exit(1);
        }
    }
    
    server.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ API available at http://localhost:${PORT}`);
    });
};

connectDatabase();
