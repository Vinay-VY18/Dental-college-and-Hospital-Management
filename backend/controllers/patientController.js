const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const PGDoctor = require('../models/PGDoctor');
const Counter = require('../models/Counter');
const jwt = require('jsonwebtoken');

const generatePatientToken = (patient) => {
  return jwt.sign(
    { id: patient._id, patientId: patient.patientId, role: 'PATIENT' },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '30d' }
  );
};

const normalizePhoneNumber = (rawPhone) => {
  const raw = String(rawPhone || '').trim();
  if (!raw) return null;

  // Convert common separators to a compact number representation.
  let compact = raw.replace(/[\s\-()]/g, '');

  // Handle international prefix notation 00XXXXXXXX.
  if (compact.startsWith('00')) {
    compact = `+${compact.slice(2)}`;
  }

  if (compact.startsWith('+')) {
    const digits = compact.slice(1).replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }

  const digitsOnly = compact.replace(/\D/g, '');
  if (!digitsOnly) return null;

  // India-friendly defaults while still accepting international lengths.
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) return `+91${digitsOnly.slice(1)}`;
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) return `+${digitsOnly}`;
  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) return `+${digitsOnly}`;

  return null;
};

const buildPhoneLookupValues = (rawPhone) => {
  const values = new Set();
  const trimmed = String(rawPhone || '').trim();
  const normalized = normalizePhoneNumber(trimmed);
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (trimmed) values.add(trimmed);
  if (normalized) values.add(normalized);
  if (digitsOnly) values.add(digitsOnly);

  if (normalized) {
    const normalizedDigits = normalized.slice(1);
    values.add(normalizedDigits);

    // Backward compatibility for legacy Indian local formats in existing records.
    if (normalized.startsWith('+91') && normalizedDigits.length === 12) {
      const local = normalizedDigits.slice(2);
      values.add(local);
      values.add(`0${local}`);
      values.add(`91${local}`);
    }
  }

  return Array.from(values);
};

const DAY_INDEX = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PUBLIC_HOLIDAYS = {
  '01-26': 'Republic Day',
  '05-01': 'Labour Day',
  '08-15': 'Independence Day',
  '10-02': 'Gandhi Jayanti',
  '12-25': 'Christmas'
};

const STANDARD_OPD_START = '09:00';
const STANDARD_OPD_END = '21:00';
const MIN_DEPARTMENT_SLOT_COUNT = 24; // Keep total slot count between 23-30.

const toMinutes = (timeStr) => {
  const [h, m] = String(timeStr || '').split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return (h * 60) + m;
};

const parseFlexibleTimeToken = (token) => {
  if (!token) return null;
  const value = String(token).trim().toLowerCase();

  const ampmMatch = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    let hour = Number(ampmMatch[1]);
    const mins = Number(ampmMatch[2] || '0');
    const meridiem = ampmMatch[3].toLowerCase();

    if (hour === 12) hour = meridiem === 'am' ? 0 : 12;
    else if (meridiem === 'pm') hour += 12;

    return `${String(hour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  const hhmmMatch = value.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmmMatch) {
    return `${String(Number(hhmmMatch[1])).padStart(2, '0')}:${hhmmMatch[2]}`;
  }

  const hourOnlyMatch = value.match(/^(\d{1,2})$/);
  if (hourOnlyMatch) {
    const hourNum = Number(hourOnlyMatch[1]);
    if (hourNum >= 0 && hourNum <= 7) {
      return `${String(hourNum + 12).padStart(2, '0')}:00`;
    }
    return `${String(hourNum).padStart(2, '0')}:00`;
  }

  return null;
};

const toHHMM = (minutes) => {
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

const buildTimeSlots = (start, end, interval = 30) => {
  const slots = [];
  const startMins = toMinutes(start);
  const endMins = toMinutes(end);

  if (startMins === null || endMins === null || endMins <= startMins) return slots;

  for (let current = startMins; current + interval <= endMins; current += interval) {
    slots.push(toHHMM(current));
  }

  return slots;
};

const expandDayRange = (startDay, endDay) => {
  const startIdx = DAY_INDEX[startDay];
  const endIdx = DAY_INDEX[endDay];
  if (startIdx === undefined || endIdx === undefined) return [];

  const days = [];
  if (startIdx <= endIdx) {
    for (let i = startIdx; i <= endIdx; i += 1) days.push(i);
  } else {
    for (let i = startIdx; i <= 6; i += 1) days.push(i);
    for (let i = 0; i <= endIdx; i += 1) days.push(i);
  }

  return days;
};

const parseDoctorSchedule = (scheduleText) => {
  const raw = String(scheduleText || '').trim();
  const normalized = raw.replace(/\s+/g, ' ').trim();

  const segments = [];
  const offDays = new Set();

  // Supports examples like: Mon Off, Sun Off
  const offRegex = /(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s*Off/gi;
  let offMatch = offRegex.exec(normalized);
  while (offMatch) {
    offDays.add(DAY_INDEX[offMatch[1].toUpperCase()]);
    offMatch = offRegex.exec(normalized);
  }

  // Supports examples like: Mon-Fri 09:00-17:00
  const dayRangeRegex = /(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s*-\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/gi;
  let rangeMatch = dayRangeRegex.exec(normalized);
  while (rangeMatch) {
    const days = expandDayRange(rangeMatch[1].toUpperCase(), rangeMatch[2].toUpperCase())
      .filter((day) => !offDays.has(day));
    if (days.length > 0) {
      segments.push({ days, start: rangeMatch[3], end: rangeMatch[4] });
    }
    rangeMatch = dayRangeRegex.exec(normalized);
  }

  // Supports examples like: Mon,Wed,Fri 10:00-14:00
  const dayListRegex = /((?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)(?:\s*,\s*(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat))+?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/gi;
  let listMatch = dayListRegex.exec(normalized);
  while (listMatch) {
    const days = listMatch[1]
      .split(',')
      .map((day) => DAY_INDEX[day.trim().toUpperCase()])
      .filter((day) => day !== undefined && !offDays.has(day));
    if (days.length > 0) {
      segments.push({ days, start: listMatch[2], end: listMatch[3] });
    }
    listMatch = dayListRegex.exec(normalized);
  }

  // Supports examples like: Daily 09:00-17:00
  const dailyRegex = /Daily\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/i;
  const dailyMatch = normalized.match(dailyRegex);
  if (dailyMatch) {
    const days = [0, 1, 2, 3, 4, 5, 6].filter((day) => !offDays.has(day));
    if (days.length > 0) {
      segments.push({ days, start: dailyMatch[1], end: dailyMatch[2] });
    }
  }

  // Fallback: if only a time range is provided, default to Mon-Sat
  if (segments.length === 0) {
    const timeOnly = normalized.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (timeOnly) {
      const days = [1, 2, 3, 4, 5, 6].filter((day) => !offDays.has(day));
      if (days.length > 0) {
        segments.push({ days, start: timeOnly[1], end: timeOnly[2] });
      }
    }
  }

  // Fallback: support user formats like "2to5", "2 to 5", "2:30pm", "5"
  if (segments.length === 0) {
    const compact = normalized.replace(/\s+/g, '').toLowerCase();
    const simpleRangeMatch = compact.match(/^(\d{1,2}(?::\d{2})?(?:am|pm)?)\s*(?:-|to)\s*(\d{1,2}(?::\d{2})?(?:am|pm)?)$/i);

    if (simpleRangeMatch) {
      const start = parseFlexibleTimeToken(simpleRangeMatch[1]);
      const end = parseFlexibleTimeToken(simpleRangeMatch[2]);
      const days = [1, 2, 3, 4, 5, 6].filter((day) => !offDays.has(day));

      if (start && end && days.length > 0) {
        segments.push({ days, start, end });
      }
    }
  }

  if (segments.length === 0) {
    const token = normalized.toLowerCase().replace(/\s+/g, '');
    const singleTime = parseFlexibleTimeToken(token);
    const startMins = toMinutes(singleTime);
    const endMins = startMins === null ? null : startMins + 30;
    const days = [1, 2, 3, 4, 5, 6].filter((day) => !offDays.has(day));

    if (singleTime && endMins !== null && days.length > 0) {
      segments.push({ days, start: singleTime, end: toHHMM(endMins) });
    }
  }

  return {
    raw: normalized,
    segments
  };
};

const normalizeDepartment = (value) => String(value || '').trim().toLowerCase();

const isSameCalendarDate = (leftDate, rightDate) => (
  leftDate.getFullYear() === rightDate.getFullYear()
  && leftDate.getMonth() === rightDate.getMonth()
  && leftDate.getDate() === rightDate.getDate()
);

const getPublicHolidayInfo = (dateObj) => {
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const holidayName = PUBLIC_HOLIDAYS[`${mm}-${dd}`] || null;
  return {
    isPublicHoliday: Boolean(holidayName),
    holidayName
  };
};

const getDaySlotsFromSegments = (segments, dayIndex) => {
  const slotSet = new Set();
  let dayTiming = null;

  segments.forEach((segment) => {
    if (segment.days.includes(dayIndex)) {
      const slots = buildTimeSlots(segment.start, segment.end);
      slots.forEach((slot) => slotSet.add(slot));
      dayTiming = dayTiming || `${segment.start} - ${segment.end}`;
    }
  });

  return {
    slots: Array.from(slotSet).sort(),
    dayTiming
  };
};

const buildBookingAvailability = async (department, dateInput) => {
  const normalizedDept = normalizeDepartment(department);
  const bookingDate = new Date(`${dateInput}T00:00:00`);

  if (!department || Number.isNaN(bookingDate.getTime())) {
    throw new Error('Department and valid date are required.');
  }

  const allDoctors = await PGDoctor.find();
  const deptDoctors = allDoctors.filter(
    (doctor) => normalizeDepartment(doctor.specialty) === normalizedDept
  );

  const dayIndex = bookingDate.getDay();
  const { isPublicHoliday, holidayName } = getPublicHolidayInfo(bookingDate);
  const now = new Date();
  const isBookingForToday = isSameCalendarDate(bookingDate, now);
  const currentTimeInMinutes = (now.getHours() * 60) + now.getMinutes();

  const start = new Date(`${dateInput}T00:00:00`);
  const end = new Date(`${dateInput}T23:59:59.999`);

  const dayAppointments = await Appointment.find({
    department,
    date: { $gte: start, $lte: end },
    status: { $ne: 'Cancelled' }
  }).select('time assignedDoctor');

  const bookedBySlot = dayAppointments.reduce((acc, appt) => {
    const key = appt.time;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const standardDepartmentSlots = buildTimeSlots(STANDARD_OPD_START, STANDARD_OPD_END);

  const doctorAvailability = deptDoctors.map((doctor) => {
    const parsed = parseDoctorSchedule(doctor.schedule);

    if (doctor.status !== 'Available') {
      return {
        id: doctor._id,
        name: doctor.name,
        status: doctor.status,
        schedule: parsed.raw || doctor.schedule || 'Not specified',
        dayStatus: 'Off-Duty',
        dayTiming: null,
        availableSlots: []
      };
    }

    if (isPublicHoliday) {
      return {
        id: doctor._id,
        name: doctor.name,
        status: doctor.status,
        schedule: parsed.raw || doctor.schedule || 'Not specified',
        dayStatus: 'Holiday',
        dayTiming: null,
        availableSlots: []
      };
    }

    const { slots, dayTiming } = getDaySlotsFromSegments(parsed.segments, dayIndex);
    const normalizedSlots =
      slots.length >= MIN_DEPARTMENT_SLOT_COUNT
        ? slots
        : standardDepartmentSlots;

    const remainingSlots = isBookingForToday
      ? normalizedSlots.filter((slot) => {
          const slotMinutes = toMinutes(slot);
          return slotMinutes !== null && slotMinutes >= currentTimeInMinutes;
        })
      : normalizedSlots;

    const normalizedTiming =
      slots.length >= MIN_DEPARTMENT_SLOT_COUNT
        ? dayTiming
        : `${STANDARD_OPD_START} - ${STANDARD_OPD_END}`;

    return {
      id: doctor._id,
      name: doctor.name,
      status: doctor.status,
      schedule: parsed.raw || doctor.schedule || 'Not specified',
      dayStatus: 'Available',
      dayTiming: normalizedTiming,
      availableSlots: remainingSlots
    };
  });

  const slotCapacity = {};
  doctorAvailability
    .filter((doctor) => doctor.dayStatus === 'Available')
    .forEach((doctor) => {
      doctor.availableSlots.forEach((slot) => {
        slotCapacity[slot] = (slotCapacity[slot] || 0) + 1;
      });
    });

  const availableSlots = Object.keys(slotCapacity)
    .filter((slot) => (bookedBySlot[slot] || 0) < slotCapacity[slot])
    .sort();

  const fullyBookedSlots = Object.keys(slotCapacity)
    .filter((slot) => (bookedBySlot[slot] || 0) >= slotCapacity[slot])
    .sort();

  const weekdayTimingSummary = Array.from(
    new Set(
      doctorAvailability
        .filter((doctor) => doctor.dayStatus === 'Available' && doctor.dayTiming)
        .map((doctor) => doctor.dayTiming)
    )
  ).join(', ');

  const messages = [];
  if (isPublicHoliday) {
    messages.push(`Hospital OPD is closed for public holiday: ${holidayName}.`);
  }
  if (!isPublicHoliday && availableSlots.length === 0) {
    messages.push('No available booking slots for the selected date.');
  }

  return {
    department,
    date: dateInput,
    dayName: DAY_NAMES[dayIndex],
    isPublicHoliday,
    publicHolidayName: holidayName,
    doctors: doctorAvailability,
    availableSlots,
    fullyBookedSlots,
    bookedBySlot,
    slotCapacity,
    weekdayTimingSummary,
    messages
  };
};

const selectDoctorForSlot = async ({ department, dateInput, time, availability }) => {
  const eligibleDoctors = (availability.doctors || []).filter(
    (doctor) => doctor.dayStatus === 'Available' && doctor.availableSlots.includes(time)
  );

  if (eligibleDoctors.length === 0) {
    return null;
  }

  const start = new Date(`${dateInput}T00:00:00`);
  const end = new Date(`${dateInput}T23:59:59.999`);

  const bookedAtSameSlot = await Appointment.find({
    department,
    date: { $gte: start, $lte: end },
    time,
    status: { $ne: 'Cancelled' },
    assignedDoctor: { $ne: null }
  }).select('assignedDoctor');

  const occupiedDoctorIds = new Set(
    bookedAtSameSlot
      .map((appt) => appt.assignedDoctor)
      .filter(Boolean)
      .map((id) => String(id))
  );

  let freeDoctors = eligibleDoctors.filter(
    (doctor) => !occupiedDoctorIds.has(String(doctor.id))
  );

  // Legacy fallback: if old records have unassigned doctors, avoid hard-failing slot assignment.
  if (freeDoctors.length === 0) {
    freeDoctors = eligibleDoctors;
  }

  const doctorLoadRows = await Appointment.aggregate([
    {
      $match: {
        department,
        date: { $gte: start, $lte: end },
        status: { $ne: 'Cancelled' },
        assignedDoctor: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$assignedDoctor',
        count: { $sum: 1 }
      }
    }
  ]);

  const loadByDoctor = doctorLoadRows.reduce((acc, row) => {
    acc[String(row._id)] = row.count;
    return acc;
  }, {});

  freeDoctors.sort((a, b) => {
    const aLoad = loadByDoctor[String(a.id)] || 0;
    const bLoad = loadByDoctor[String(b.id)] || 0;
    return aLoad - bLoad;
  });

  return freeDoctors[0] || null;
};

const registerPatientAccount = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone, and password are required.' });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number with country code (example: +919876543210).' });
    }

    const phoneLookupValues = buildPhoneLookupValues(phone);
    const phoneQuery = { $or: [{ phone: { $in: phoneLookupValues } }, { phoneNumber: { $in: phoneLookupValues } }] };

    const query = email
      ? { $or: [...phoneQuery.$or, { email: email.toLowerCase().trim() }] }
      : phoneQuery;

    let patient = await Patient.findOne(query).select('+password');

    if (patient && patient.password) {
      return res.status(409).json({ success: false, message: 'Patient account already exists. Please login.' });
    }

    if (patient && !patient.password) {
      patient.name = name;
      patient.phone = normalizedPhone;
      patient.phoneNumber = normalizedPhone;
      patient.email = email ? email.toLowerCase().trim() : patient.email;
      patient.password = password;
      await patient.save();
    } else if (!patient) {
      patient = await Patient.create({
        name,
        phone: normalizedPhone,
        phoneNumber: normalizedPhone,
        email: email ? email.toLowerCase().trim() : undefined,
        password
      });
      patient = await Patient.findById(patient._id).select('+password');
    }

    const token = generatePatientToken(patient);

    res.status(201).json({
      success: true,
      message: 'Patient account created successfully.',
      token,
      patient: {
        _id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        phone: patient.phone,
        email: patient.email
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const loginPatientAccount = async (req, res) => {
  try {
    const { patientId, phone, password } = req.body;

    if ((!patientId && !phone) || !password) {
      return res.status(400).json({ success: false, message: 'Patient ID or phone, and password are required.' });
    }

    let patient;
    if (patientId) {
      patient = await Patient.findOne({ patientId: patientId.trim().toUpperCase() }).select('+password');
    } else {
      const normalizedPhone = normalizePhoneNumber(phone);
      if (!normalizedPhone) {
        return res.status(400).json({ success: false, message: 'Enter a valid phone number with country code (example: +919876543210).' });
      }

      const phoneLookupValues = buildPhoneLookupValues(phone);
      patient = await Patient.findOne({
        $or: [{ phone: { $in: phoneLookupValues } }, { phoneNumber: { $in: phoneLookupValues } }]
      }).select('+password');
    }

    if (!patient || !patient.password) {
      return res.json({ success: false, message: 'Account not found. Please register first.' });
    }

    const matched = await patient.matchPassword(password);
    if (!matched) {
      return res.json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generatePatientToken(patient);

    res.json({
      success: true,
      token,
      patient: {
        _id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        phone: patient.phone,
        email: patient.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.json({
      success: true,
      patient: {
        _id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        phone: patient.phone,
        email: patient.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.patient.id })
      .populate('assignedDoctor', 'name specialty')
      .sort({ date: -1, createdAt: -1 });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const pastAppointments = [];
    const currentAppointments = [];

    appointments.forEach((appt) => {
      const apptDate = new Date(appt.date);
      const isPast = ['Completed', 'Cancelled'].includes(appt.status) || apptDate < startOfToday;

      if (isPast) {
        pastAppointments.push(appt);
      } else {
        currentAppointments.push(appt);
      }
    });

    res.json({
      success: true,
      appointments,
      currentAppointments,
      pastAppointments,
      summary: {
        total: appointments.length,
        current: currentAppointments.length,
        past: pastAppointments.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingAvailability = async (req, res) => {
  try {
    const { department, date } = req.query;
    const availability = await buildBookingAvailability(department, date);
    res.json({ success: true, ...availability });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { name, phone, department, date, time } = req.body;

    if (!name || !phone || !department || !date || !time) {
      return res.status(400).json({ success: false, message: 'Name, phone, department, date, and time are required.' });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number with country code (example: +919876543210).' });
    }

    const availability = await buildBookingAvailability(department, date);

    if (availability.isPublicHoliday) {
      return res.status(400).json({
        success: false,
        message: `Hospital OPD is closed on ${availability.publicHolidayName}. Please choose another date.`
      });
    }

    if (!availability.availableSlots.includes(time)) {
      return res.status(400).json({
        success: false,
        message: `Selected slot is unavailable. Available slots: ${availability.availableSlots.join(', ') || 'None'}`
      });
    }

    const assignedDoctor = await selectDoctorForSlot({ department, dateInput: date, time, availability });
    if (!assignedDoctor) {
      return res.status(400).json({
        success: false,
        message: 'No doctor is available for the selected slot. Please choose another time.'
      });
    }

    // Find or create patient
    const phoneLookupValues = buildPhoneLookupValues(phone);
    let patient = await Patient.findOne({
      $or: [{ phone: { $in: phoneLookupValues } }, { phoneNumber: { $in: phoneLookupValues } }]
    });
    if (!patient) {
      patient = new Patient({ name, phone: normalizedPhone, phoneNumber: normalizedPhone });
      await patient.save();
    } else {
      patient.name = patient.name || name;
      if (!patient.phone || patient.phone !== normalizedPhone) {
        patient.phone = normalizedPhone;
      }
      if (!patient.phoneNumber || patient.phoneNumber !== normalizedPhone) {
        patient.phoneNumber = normalizedPhone;
      }
      await patient.save();
    }

    // Atomic increment for Daily Token Number
    const bookingDate = date ? new Date(date).toISOString().split('T')[0].replace(/-/g, '_') : new Date().toISOString().split('T')[0].replace(/-/g, '_');
    const counterId = `${department.trim().toUpperCase().replace(/\s+/g, '_')}_${bookingDate}`;
    
    console.log('Counter Debug - Using Daily ID:', counterId);
    const counter = await Counter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    const trackingId = 'RRDCH-' + Math.floor(1000 + Math.random() * 9000);
    const appointment = new Appointment({
      patient: patient._id,
      department,
      assignedDoctor: assignedDoctor.id,
      date,
      time,
      tokenNumber: counter.seq,
      trackingId,
      status: 'Pending'
    });

    await appointment.save();

    if (req.io) {
      req.io.emit('queueUpdate', { 
        department,
        waitingPatients: await Appointment.countDocuments({ department, status: 'Pending' })
      });
    }

    res.status(201).json({
      success: true,
      trackingId,
      tokenNumber: counter.seq,
      assignedDoctor: {
        id: assignedDoctor.id,
        name: assignedDoctor.name,
        specialty: assignedDoctor.specialty
      },
      message: 'Appointment booked successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const callNextPatient = async (req, res) => {
  try {
    const { department } = req.params;

    // 1. Finish current patient
    await Appointment.updateMany(
      { department, status: 'In-Treatment' },
      { status: 'Completed' }
    );

    // 2. Call next pending patient
    const nextPatient = await Appointment.findOne({ department, status: 'Pending' }).sort({ tokenNumber: 1 });
    
    if (nextPatient) {
      nextPatient.status = 'In-Treatment';
      await nextPatient.save();
    }

    // 3. Get current queue status for socket emission
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

    // 4. Emit real-time queue update to all connected clients
    if (req.io) {
      req.io.emit('queueUpdate', {
        department,
        currentToken: inTreatment ? inTreatment.tokenNumber : '---',
        waitingCount,
        statusChange: true
      });
    }

    // 5. Trigger Notification for patient whose turn is coming up
    if (inTreatment) {
      const notifyTokenNumber = inTreatment.tokenNumber + 2;
      const patientToNotify = await Appointment.findOne({
        department,
        date: { $gte: start, $lt: end },
        tokenNumber: notifyTokenNumber,
        status: 'Pending'
      }).populate('patient');

      if (patientToNotify) {
        const Subscription = require('../models/Subscription');
        const webpush = require('web-push');

        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT || 'mailto:admin@rrdch.edu.in',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );

        const subObj = await Subscription.findOne({ patient: patientToNotify.patient._id });
        if (subObj) {
           const payload = JSON.stringify({
             title: 'RRDCH: Your Turn is Soon! / ಆರ್.ಆರ್.ಡಿ.ಸಿ.ಎಚ್: ನಿಮ್ಮ ಸರದಿ ಹತ್ತಿರದಲ್ಲಿದೆ!',
             body: `Current Token: ${inTreatment.tokenNumber}. You are Token ${notifyTokenNumber}. Please proceed to the ${department} department.`
           });
           try {
             await webpush.sendNotification(subObj.subscription, payload);
             console.log(`Push notification sent to ${notifyTokenNumber}`);
           } catch(e) {
             console.error("Web push error", e);
           }
        }
      }
    }

    res.json({ success: true, message: 'Queue advanced' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getLiveStatus = async (req, res) => {
  try {
    const { department } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];
    const start = new Date(todayStr);
    const end = new Date(todayStr);
    end.setDate(end.getDate() + 1);
    
    const query = { 
      department, 
      date: { $gte: start, $lt: end },
      status: 'In-Treatment' 
    };

    const inTreatment = await Appointment.findOne(query);
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
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.io) {
      req.io.emit('queueUpdate', { 
        department: appointment.department,
        waitingPatients: await Appointment.countDocuments({ department: appointment.department, status: 'Pending' })
      });
      req.io.emit(`appointmentUpdate-${appointment.trackingId}`, appointment);
    }
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAppointmentStatus = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const appointment = await Appointment.findOne({ trackingId })
      .populate('patient')
      .populate('assignedDoctor', 'name specialty');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const { dept, date } = req.query;
    const query = {};
    if (dept) query.department = dept;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }
    
    const appointments = await Appointment.find(query)
      .populate('patient')
      .populate('assignedDoctor', 'name specialty')
      .sort({ tokenNumber: 1 })
      .lean();
      
    try {
      const Subscription = require('../models/Subscription');
      const subs = await Subscription.find({});
      const subPatientIds = new Set(subs.map(s => s.patient.toString()));
      appointments.forEach(appt => {
        if (appt.patient && subPatientIds.has(appt.patient._id.toString())) {
          appt.hasPush = true;
        } else {
          appt.hasPush = false;
        }
      });
    } catch (e) {
      console.error('Subscription error in admin', e);
    }
    
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteAppointmentAdmin = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) return res.status(404).json({ success: false });
    
    if (req.io && appt) {
      req.io.emit('queueUpdate', { 
        department: appt.department,
        waitingPatients: await Appointment.countDocuments({ department: appt.department, status: 'Pending' })
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const editAppointmentAdmin = async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, appointment: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const verifyPatientIdentity = async (req, res) => {
  try {
    const { patientId, phone } = req.body;

    if (!patientId && !phone) {
      return res.status(400).json({ success: false, message: 'Patient ID or phone is required.' });
    }

    let patient;
    if (patientId) {
      patient = await Patient.findOne({ patientId: patientId.trim().toUpperCase() });
    } else {
      const normalizedPhone = normalizePhoneNumber(phone);
      if (!normalizedPhone) {
        return res.status(400).json({ success: false, message: 'Enter a valid phone number with country code (example: +919876543210).' });
      }

      const phoneLookupValues = buildPhoneLookupValues(phone);
      patient = await Patient.findOne({
        $or: [{ phone: { $in: phoneLookupValues } }, { phoneNumber: { $in: phoneLookupValues } }]
      });
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient account not found.' });
    }

    res.json({
      success: true,
      message: 'Patient verified successfully.',
      patientId: patient.patientId,
      name: patient.name
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const resetPatientPassword = async (req, res) => {
  try {
    const { patientId, newPassword } = req.body;

    if (!patientId || !newPassword) {
      return res.status(400).json({ success: false, message: 'Patient ID and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const patient = await Patient.findOne({ patientId: patientId.trim().toUpperCase() });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient account not found.' });
    }

    patient.password = newPassword;
    await patient.save();

    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerPatientAccount,
  loginPatientAccount,
  getMyPatientProfile,
  getMyAppointments,
  getBookingAvailability,
  bookAppointment,
  getAppointmentStatus,
  updateAppointmentStatus,
  getAllAppointmentsAdmin,
  deleteAppointmentAdmin,
  editAppointmentAdmin,
  callNextPatient,
  getLiveStatus,
  verifyPatientIdentity,
  resetPatientPassword
};
