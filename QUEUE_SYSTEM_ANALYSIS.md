# RRDCH Queue System Architecture & Issues Analysis

## Current Implementation Status

### 1. **LiveQueueView (Frontend Patient Display)**

**Location**: `frontend/src/pages/LiveQueueView.jsx`

**Data Fetching Mechanism**: **POLLING (Interval-based)**
- Fetches every 15 seconds via interval
- Endpoint: `GET /api/patients/live-status/:department`
- No WebSocket/real-time connection

**Display Information**:
- `currentToken`: Currently serving patient token number
- `waitingCount`: Number of pending patients awaiting service
- Estimated wait: Calculated as `waitingCount * 10 minutes`

**Code Flow**:
```javascript
useEffect(() => {
  const fetchQueue = async () => {
    const res = await axios.get(`/api/patients/live-status/${selectedDept}`);
    setLiveData({
      currentToken: res.data.currentToken,
      waitingCount: res.data.waitingCount
    });
  };
  
  fetchQueue();
  const interval = setInterval(fetchQueue, 15000); // Polls every 15 seconds
  return () => clearInterval(interval);
}, [selectedDept]);
```

**Issues**:
- ❌ No Socket.IO listener - doesn't receive real-time updates
- ❌ 15-second delay before queue display updates
- ❌ Department change triggers immediate fetch but still subject to 15s polling

---

### 2. **AdminDashboard (Queue Management & Control)**

**Location**: `frontend/src/pages/admin/AdminDashboard.jsx`

**Queue Display Section**:
- Shows all appointments for selected department and date
- **Control Button**: "FINISH & CALL NEXT" (line 538)
- Manual status override via dropdown (`Pending` → `In-Treatment` → `Completed` → `Cancelled`)

**Button Flow**:
```javascript
const callNext = async (dept) => {
  try {
    await axios.patch(
      `http://localhost:5000/api/patients/admin/next/${encodeURIComponent(dept)}`,
      {},
      { headers: { Authorization: `Bearer ${token}` }}
    );
    fetchData(); // Refreshes appointment list
  } catch (err) {
    alert('Failed to call next patient');
  }
};
```

**Data Fetching**: 
- `fetchData()` is called on tab change, department change, or date change
- Fetches from: `GET /api/patients/admin/all?dept=${dept}&date=${date}`
- Applies admin token authorization

**Issues**:
- ❌ After "FINISH & CALL NEXT", relies on `fetchData()` which polls endpoint
- ❌ No Socket.IO listener to receive immediate queue updates
- ❌ Data refresh depends on endpoint responsiveness, not event-driven

---

### 3. **Backend: Socket.IO Setup**

**Location**: `backend/server.js` (lines 7-50)

**Initialization**:
```javascript
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  // Sends HARDCODED initial data
  socket.emit('queueUpdate', { currentQueueNumber: 101, waitingPatients: 12 });
  
  socket.on('nextPatient', () => {
    currentQueueNumber++;
    if (waitingPatients > 0) waitingPatients--;
    io.emit('queueUpdate', { currentQueueNumber, waitingPatients });
  });
});
```

**Critical Issue**: 
- ❌ **Socket.IO is NOT connected to real appointment database**
- ❌ Uses hardcoded values: `currentQueueNumber = 101`, `waitingPatients = 12`
- ❌ Socket listener `nextPatient` is never triggered from admin actions
- ✅ Socket.IO infrastructure exists but not utilized for real queue data

---

### 4. **Backend: Patient Controller - Queue Endpoints**

**Location**: `backend/controllers/patientController.js`

#### **Endpoint 1: `callNextPatient()` (lines 685-710)**
Called by admin "FINISH & CALL NEXT" button
```javascript
const callNextPatient = async (req, res) => {
  const { department } = req.params;
  
  // Step 1: Mark current patient as Completed
  await Appointment.updateMany(
    { department, status: 'In-Treatment' },
    { status: 'Completed' }
  );
  
  // Step 2: Get next pending patient
  const nextPatient = await Appointment.findOne(
    { department, status: 'Pending' }
  ).sort({ tokenNumber: 1 });
  
  if (nextPatient) {
    nextPatient.status = 'In-Treatment';
    await nextPatient.save();
  }
  
  // Step 3: Emit socket event (INCOMPLETE - no currentToken data)
  if (req.io) {
    req.io.emit('queueUpdate', { department, statusChange: true });
  }
  
  res.json({ success: true, message: 'Queue advanced' });
};
```

**Issues**:
- ❌ Emits `queueUpdate` but **doesn't include the new current token number**
- ❌ Socket event data has no `currentToken` or `waitingCount`
- ✅ Database updates are correct (marks In-Treatment as Completed, calls next Pending)
- ❌ No verification that the operation succeeded before notifying

---

#### **Endpoint 2: `getLiveStatus()` (lines 713-742)**
Called by LiveQueueView every 15 seconds
```javascript
const getLiveStatus = async (req, res) => {
  const { department } = req.params;
  const todayStr = new Date().toISOString().split('T')[0];
  const start = new Date(todayStr);
  const end = new Date(todayStr);
  end.setDate(end.getDate() + 1);
  
  // Get currently serving appointment
  const inTreatment = await Appointment.findOne({
    department,
    date: { $gte: start, $lt: end },
    status: 'In-Treatment'
  });
  
  // Count waiting patients
  const waitingCount = await Appointment.countDocuments({
    department,
    date: { $gte: start, $lt: end },
    status: 'Pending'
  });
  
  res.json({
    success: true,
    currentToken: inTreatment ? inTreatment.tokenNumber : '---',
    waitingCount
  });
};
```

**Status**: ✅ **CORRECTLY IMPLEMENTED**
- Queries real appointment data
- Returns accurate current token and waiting count
- Only matches today's appointments

---

### 5. **Route Configuration**

**Location**: `backend/routes/patientRoutes.js`

```javascript
router.patch('/admin/next/:department', 
  protect, 
  authorize('SUPER_ADMIN', 'ADMIN_CLINIC'), 
  callNextPatient
);

router.get('/live-status/:department', getLiveStatus);
```

**Issues**: ✅ Routes are correctly configured

---

### 6. **Data Model: Appointment**

**Location**: `backend/models/Appointment.js`

```javascript
{
  patient: ObjectId,          // Reference to Patient
  department: String,         // e.g., "General Checkup"
  assignedDoctor: ObjectId,   // Null if unassigned
  date: Date,                 // Appointment date
  time: String,               // Appointment time
  tokenNumber: Number,        // Queue token
  trackingId: String,         // Unique tracking ID
  status: Enum,               // 'Pending', 'In-Treatment', 'Completed', 'Cancelled'
  createdAt: Date
}
```

**Issues**: 
- ✅ Schema supports queue tracking
- ⚠️ `status` field is the only indicator of queue position (no `queuePosition` field)

---

## Summary: "FINISH & CALL NEXT" Button Flow

### What Actually Happens:
1. **Admin clicks "FINISH & CALL NEXT"** in Dashboard
2. → Calls `PATCH /api/patients/admin/next/Oral Surgery`
3. → Backend: Marks current `In-Treatment` as `Completed`
4. → Backend: Sets next `Pending` to `In-Treatment`
5. → Backend: Emits `io.emit('queueUpdate', { department, statusChange: true })` ❌ **INCOMPLETE DATA**
6. → **LiveQueueView is NOT listening** to socket event
7. → LiveQueueView polls again in 15 seconds and gets correct data
8. → AdminDashboard calls `fetchData()` immediately and shows updated queue

### Time Delay Problem:
- Admin action: **Immediate backend update** ✅
- Admin sees update: **Immediate** (via `fetchData()` call) ✅
- Patient sees update in LiveQueueView: **Up to 15 seconds delay** ❌

---

## Critical Issues Summary

| # | Issue | Impact | Solution |
|---|-------|--------|----------|
| 1 | Socket.IO not connected to real data | Live updates don't work | Connect Socket to appointment DB queries |
| 2 | `callNextPatient` emits incomplete data | Frontend can't consume event | Include `currentToken` in socket emit |
| 3 | LiveQueueView doesn't listen to socket events | Page shows polling-only updates | Add socket listener for `queueUpdate` |
| 4 | 15-second polling delay | Patients see outdated queue data | Switch to socket-driven updates |
| 5 | Socket events not triggered from admin actions | Real-time updates inactive | Ensure `callNextPatient` triggers proper events |
| 6 | PatientPortal not integrated with queue updates | Patients unaware of current position | Add queue status to patient dashboard |

---

## Mechanism Analysis

### Current Update Mechanism: **Polling Only**
- ✅ Works correctly
- ❌ Inefficient and slow
- ❌ Database load increases with every connected user

### Intended Mechanism: **WebSocket (Socket.IO)**
- ✅ Infrastructure exists
- ❌ **Not properly implemented for queue data**
- ❌ Frontend not listening to socket events
- ❌ Backend emitting incomplete/dummy data

---

## Detailed Architecture Diagram

```
┌─────────────────────────────────────────┐
│          ADMIN DASHBOARD                │
│  [FINISH & CALL NEXT Button]            │
└────────────┬────────────────────────────┘
             │
             │ PATCH /api/patients/admin/next/:dept
             ▼
┌─────────────────────────────────────────┐
│     BACKEND: callNextPatient()          │
│  1. Mark In-Treatment → Completed       │
│  2. Move Pending → In-Treatment         │
│  3. Emit queueUpdate (INCOMPLETE DATA)  │
└────────────┬────────────────────────────┘
             │
       ┌─────┴──────────────┐
       │                    │
       ▼                    ▼
  [Socket.IO]         [AdminDashboard]
  (Not Listened)      (Polls live-status)
       ❌                   ✅ Updates in <1s
       
       
┌─────────────────────────────────────────┐
│      LIVEQUEUEVIEW (Patient Display)    │
│   Polls every 15 seconds                │
│   GET /api/patients/live-status/:dept   │
│   (Correct but SLOW)                    │
└─────────────────────────────────────────┘
```

---

## Recommendations to Fix

1. **Modify `callNextPatient()` to emit proper data**:
   - Include `currentToken`, `waitingCount`, `department`
   - Emit to `queueUpdate-${department}` channel for targeting

2. **Add Socket.IO listener to LiveQueueView**:
   - Listen to `queueUpdate` events
   - Update state immediately instead of waiting for polling

3. **Connect Socket.IO server to real data**:
   - Remove hardcoded values from `server.js`
   - Query database on connection and interval
   - Emit real queue status to all connected clients

4. **Add real-time queue position to PatientPortal**:
   - Show "You are #X in queue" in real-time
   - Integrate with socket updates

5. **Optimize polling as fallback**:
   - Reduce polling interval if Socket.IO fails
   - Implement exponential backoff

---

## Code Locations Quick Reference

| Component | File | Lines |
|-----------|------|-------|
| LiveQueueView | `frontend/src/pages/LiveQueueView.jsx` | 1-115 |
| AdminDashboard | `frontend/src/pages/admin/AdminDashboard.jsx` | 1-800+ |
| callNextPatient | `backend/controllers/patientController.js` | 685-710 |
| getLiveStatus | `backend/controllers/patientController.js` | 713-742 |
| Socket Setup | `backend/server.js` | 7-50 |
| Routes | `backend/routes/patientRoutes.js` | 1-20 |
| Appointment Model | `backend/models/Appointment.js` | 1-13 |
