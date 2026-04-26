import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { io } from 'socket.io-client';
import axios from 'axios';
import { UserPlus, Clock, Search, CheckCircle, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations, deptMap } from '../utils/translations';

// Socket initialized per-component to avoid connection issues

const normalizeBookingPhone = (rawPhone) => {
  const raw = String(rawPhone || '').trim();
  if (!raw) return '';

  let compact = raw.replace(/[\s\-()]/g, '');
  if (compact.startsWith('00')) compact = `+${compact.slice(2)}`;

  if (compact.startsWith('+')) {
    const digits = compact.slice(1).replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) return '';
    return `+${digits}`;
  }

  const digitsOnly = compact.replace(/\D/g, '');
  if (!digitsOnly) return '';
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) return `+91${digitsOnly.slice(1)}`;
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) return `+${digitsOnly}`;
  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) return `+${digitsOnly}`;

  return '';
};

const PatientPortal = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  const todayDate = new Date().toISOString().split('T')[0];
  const [doctors, setDoctors] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      phone: '+91'
    }
  });
  const currentDept = watch("department");
  const selectedDate = watch("date");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingIdRes, setTrackingIdRes] = useState('');
  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [tokenRes, setTokenRes] = useState('');
  const [assignedDoctorRes, setAssignedDoctorRes] = useState('');
  const [bookedDeptRes, setBookedDeptRes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingAvailability, setBookingAvailability] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [pushStatus, setPushStatus] = useState('request');
  const socketRef = useRef(null);

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
    return outputArray;
  }

  const enablePushNotifications = async (tokenContext = {}) => {
    const shouldProceed = window.confirm("Allow RRDCH to notify you via Push Alerts when your turn is near?");
    if (!shouldProceed) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert("Push notifications are not supported by your browser.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await navigator.serviceWorker.register('/sw.js');
        const readyReg = await navigator.serviceWorker.ready;
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BIZygyAfjUn_p7pgRtuGcIiAMCsHkyeSC1mFu2YTTK5K_5sux3gzEqxLN1-mxMtqeHRsB_RiZwCdWjF11VkYNNw";
        let subscription = await readyReg.pushManager.getSubscription();
        if (!subscription) {
          subscription = await readyReg.pushManager.subscribe({
            userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
          });
        }
        await axios.post('http://localhost:5000/api/notifications/subscribe', {
          subscription,
          trackingId: tokenContext.trackingId || null,
          department: tokenContext.department || null
        }, { headers: { Authorization: `Bearer ${sessionStorage.getItem('patientToken')}` } });
        setPushStatus('granted');
        
        // Fire a test notification immediately so the user can verify it works
        try {
          await axios.post('http://localhost:5000/api/notifications/test', {}, { headers: { Authorization: `Bearer ${sessionStorage.getItem('patientToken')}` } });
        } catch(e) { console.error('Ping failed', e); }
        
        alert("Success! Check your screen, a test notification was just sent!");
      } else {
        setPushStatus('denied');
        alert("Permission denied by your browser. Please allow notifications in site settings.");
      }
    } catch (err) {
      alert(`Error enabling notifications: ${err.message}`);
    }
  };

  useEffect(() => {
    const profileRaw = sessionStorage.getItem('patientProfile');
    if (!profileRaw) return;

    try {
      const profile = JSON.parse(profileRaw);
      setPatientProfile(profile);
      if (profile?.name) setValue('name', profile.name);
      if (profile?.phone) {
        const formattedPhone = normalizeBookingPhone(profile.phone);
        setValue('phone', formattedPhone || profile.phone);
      }
    } catch {
      // Ignore malformed session data and let user continue with form input
    }
  }, [setValue]);

  const handlePatientLogout = () => {
    sessionStorage.removeItem('patientToken');
    sessionStorage.removeItem('patientProfile');
    navigate('/hospital-auth');
  };

  useEffect(() => {
    // Initialize Socket.IO connection safely
    try {
      if (!socketRef.current) {
        socketRef.current = io('http://localhost:5000', {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 3
        });
      }

      const socket = socketRef.current;

      // Fetch initial doctors list
      axios.get('http://localhost:5000/api/doctors').then(res => {
        setDoctors(res.data.doctors || []);
      }).catch(console.error);

      socket.on('doctorStatusUpdate', (updatedDoc) => {
        setDoctors(prev => prev.map(doc => doc._id === updatedDoc.id ? { ...doc, available: updatedDoc.available } : doc));
      });

      return () => {
        socket.off('doctorStatusUpdate');
      };
    } catch (err) {
      console.error('Socket initialization error:', err);
      // Fallback: fetch doctors without socket
      axios.get('http://localhost:5000/api/doctors').then(res => {
        setDoctors(res.data.doctors || []);
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    setValue('time', '');

    if (!currentDept || !selectedDate) {
      setBookingAvailability(null);
      return;
    }

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const res = await axios.get('http://localhost:5000/api/patients/booking-availability', {
          params: {
            department: currentDept,
            date: selectedDate
          }
        });
        setBookingAvailability(res.data);
      } catch (err) {
        setBookingAvailability(null);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [currentDept, selectedDate, setValue]);

  const onBookAppointment = async (data) => {
    setBookingError('');
    setIsSubmitting(true);
    try {
      // Data Cleaning: Remove any unexpected metadata
      const { _id, __v, createdAt, updatedAt, ...cleanData } = data;
      const normalizedPhone = normalizeBookingPhone(cleanData.phone);

      if (!normalizedPhone) {
        const validationMessage = language === 'KN'
          ? 'ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ದೇಶ ಕೋಡ್ ಜೊತೆಗೆ ಸರಿಯಾಗಿ ನಮೂದಿಸಿ (ಉದಾ: +919876543210).'
          : 'Enter a valid phone number with country code (example: +919876543210).';
        setBookingError(validationMessage);
        setIsSubmitting(false);
        return;
      }

      cleanData.phone = normalizedPhone;

      const res = await axios.post('http://localhost:5000/api/patients/book', cleanData);
      if (res.data.success) {
        setTrackingIdRes(res.data.trackingId);
        setTokenRes(res.data.tokenNumber);
        setAssignedDoctorRes(res.data.assignedDoctor?.name || '');
        setBookedDeptRes(cleanData.department);
        setBookingSuccess(true);
        reset({
          name: patientProfile?.name || '',
          phone: normalizeBookingPhone(patientProfile?.phone) || '+91',
          department: '',
          date: '',
          time: ''
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error('Booking Error Details:', errorMsg);
      setBookingError(errorMsg);
      alert(errorMsg || t.CHECK_DOCTOR_AVAILABLE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTrackAppointment = async () => {
    if (!trackInput) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/patients/track/${encodeURIComponent(trackInput)}`);
      if (res.data.success) {
        setTrackResult(res.data.appointment);
      }
    } catch (err) {
      alert(t.TRACKING_NOT_FOUND);
      setTrackResult(null);
    }
  };

  const hasAnyDoctorAvailableInDept = currentDept
    ? doctors.some((doc) => doc.specialty === currentDept && doc.status === 'Available')
    : false;

  const hasAvailableSlots = (bookingAvailability?.availableSlots || []).length > 0;

  const isBookingDisabled =
    isSubmitting ||
    isLoadingAvailability ||
    !currentDept ||
    !selectedDate ||
    bookingAvailability?.isPublicHoliday ||
    !hasAvailableSlots;

  return (
    <div className="min-h-screen bg-brand-light py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b-2 border-brand-teal pb-4">
          <h1 className="text-3xl font-bold text-brand-blue">{t.PATIENT_SERVICES}</h1>
          <div className="flex items-center gap-3">
            {patientProfile?.patientId && (
              <div className="text-xs md:text-sm bg-white border border-gray-200 rounded-full px-4 py-2 font-semibold text-brand-blue">
                {t.PATIENT_ID_LABEL}: {patientProfile.patientId}
              </div>
            )}
            <button
              type="button"
              onClick={() => pushStatus === 'granted' ? axios.post('http://localhost:5000/api/notifications/test', {}, { headers: { Authorization: `Bearer ${sessionStorage.getItem('patientToken')}` } }).then(()=>alert('Test notification requested!')).catch(e=>alert('Test failed:'+e.message)) : enablePushNotifications()}
              className={`inline-flex items-center px-4 py-2 rounded-md font-semibold text-sm transition-colors border ${pushStatus === 'granted' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              <Bell className={`w-4 h-4 mr-2 ${pushStatus === 'granted' ? 'text-green-500 fill-current' : ''}`} />
              {pushStatus === 'granted' ? 'Send Test Ping' : 'Get Alerted'}
            </button>
            <Link
              to="/patient-dashboard"
              className="px-4 py-2 rounded-md border border-brand-teal text-brand-teal bg-white text-sm font-semibold hover:bg-brand-light"
            >
              {t.PATIENT_DASHBOARD}
            </Link>
            <button
              type="button"
              onClick={handlePatientLogout}
              className="px-4 py-2 rounded-md bg-brand-blue text-white text-sm font-semibold hover:bg-opacity-90"
            >
              {t.PATIENT_LOGOUT}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Appointment Booking Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-brand-blue text-white py-4 px-6 flex items-center">
                <UserPlus className="mr-3 h-5 w-5" />
                <h2 className="text-xl font-semibold">{t.ONLINE_BOOKING}</h2>
              </div>
              <div className="p-8">
                {bookingSuccess ? (
                  <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center flex flex-col items-center border border-green-200 shadow-inner">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{t.TOKEN_GIVEN}: #{tokenRes}</h3>
                    <p className="mb-4 font-medium">{t.TRACKING_CODE_LABEL}: <span className="text-brand-blue select-all">{trackingIdRes}</span></p>
                    <p className="mb-2 text-sm font-semibold">
                      {t.DEPT_LABEL}: <span className="text-brand-blue">{language === 'KN' ? deptMap[bookedDeptRes] || bookedDeptRes : bookedDeptRes}</span>
                    </p>
                    {assignedDoctorRes && (
                      <p className="mb-3 text-sm font-semibold">
                        {t.ASSIGNED_DOCTOR}: <span className="text-brand-blue">{assignedDoctorRes}</span>
                      </p>
                    )}
                    <div className="text-xs text-green-600 mb-4 bg-white px-4 py-2 rounded-lg">{t.PROCEED_TO_HOSPITAL}</div>
                    <div className="flex gap-4">
                      {pushStatus !== 'granted' && (
                        <button onClick={() => enablePushNotifications({ trackingId: trackingIdRes, department: watch('department') })} className="bg-brand-blue text-white px-6 py-2 rounded font-bold hover:shadow-lg transition-all flex items-center">
                          <Bell className="w-4 h-4 mr-2" /> Enable Auto-Alerts
                        </button>
                      )}
                      <button onClick={() => { setBookingSuccess(false); setTrackingIdRes(''); setAssignedDoctorRes(''); setBookedDeptRes(''); }} className="bg-brand-teal text-white px-6 py-2 rounded font-bold hover:shadow-lg transition-all">{t.DONE}</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onBookAppointment)} className="space-y-5">
                    {bookingError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-red-700 text-sm font-bold">{bookingError}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.PATIENT_NAME}</label>
                        <input
                          type="text"
                          {...register("name", { required: true })}
                          placeholder={t.PATIENT_NAME}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-brand-teal focus:border-brand-teal outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.PHONE_NUMBER}</label>
                        <p className="text-[11px] text-gray-800 mb-1">
                          {language === 'KN' ? 'ದೇಶ ಕೋಡ್ ಸೇರಿಸಿ (ಉದಾ: +91)' : 'Include country code (e.g. +91)'}
                        </p>
                        <input
                          type="tel"
                          {...register("phone", {
                            required: true,
                            validate: (value) => Boolean(normalizeBookingPhone(value))
                          })}
                          placeholder={t.PHONE_EXAMPLE}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-brand-teal outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.SELECT_DEPT}</label>
                      <select
                        {...register("department", { required: true })}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-brand-teal outline-none bg-white ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">-- {t.SELECT_DEPT} --</option>
                        {Object.entries(deptMap).map(([en, kn]) => (
                          <option key={en} value={en}>{language === 'KN' ? kn : en}</option>
                        ))}
                      </select>

                      {currentDept && !doctors.some(d => d.specialty === currentDept && d.status === 'Available') && (
                        <div className="mt-2 text-red-600 bg-red-50 p-3 rounded-lg text-xs font-bold border-2 border-red-100 flex items-center">
                          ❗ {t.NO_DOCTOR_AVAILABLE}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.PREFERRED_DATE}</label>
                        <input
                          type="date"
                          {...register("date", { required: true })}
                          min={todayDate}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-brand-teal outline-none ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.PREFERRED_TIME}</label>
                        <select
                          {...register("time", { required: true })}
                          disabled={!currentDept || !selectedDate || isLoadingAvailability || bookingAvailability?.isPublicHoliday || !hasAvailableSlots}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-brand-teal outline-none bg-white ${errors.time ? 'border-red-500' : 'border-gray-300'} ${(!currentDept || !selectedDate || isLoadingAvailability || bookingAvailability?.isPublicHoliday || !hasAvailableSlots) ? 'bg-gray-100 text-gray-800' : ''}`}
                        >
                          <option value="">
                            {isLoadingAvailability ? t.LOADING_TIMINGS : t.SELECT_TIME_SLOT}
                          </option>
                          {(bookingAvailability?.availableSlots || []).map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
                      <h4 className="text-sm font-bold text-brand-blue">{t.BOOKING_TIMINGS_TITLE}</h4>
                      {!currentDept || !selectedDate ? (
                        <p className="text-xs text-gray-700">{t.SELECT_DATE_DEPT_HINT}</p>
                      ) : isLoadingAvailability ? (
                        <p className="text-xs text-gray-700">{t.LOADING_TIMINGS}</p>
                      ) : bookingAvailability ? (
                        <>
                          <p className="text-xs text-gray-700">
                            <span className="font-semibold">{t.SELECTED_DAY}:</span> {bookingAvailability.dayName}
                          </p>

                          <p className="text-xs text-gray-700">
                            <span className="font-semibold">{t.WEEKDAY_TIMINGS}:</span>{' '}
                            {bookingAvailability.weekdayTimingSummary || t.NOT_AVAILABLE}
                          </p>

                          {bookingAvailability.isPublicHoliday && (
                            <p className="text-xs text-red-700 font-semibold bg-red-50 border border-red-200 rounded px-3 py-2">
                              {t.PUBLIC_HOLIDAY}: {bookingAvailability.publicHolidayName}. {t.PUBLIC_HOLIDAY_CLOSED}
                            </p>
                          )}

                          {!bookingAvailability.isPublicHoliday && !hasAnyDoctorAvailableInDept && (
                            <p className="text-xs text-red-700 font-semibold">{t.NO_DOCTOR_AVAILABLE}</p>
                          )}

                          {!bookingAvailability.isPublicHoliday && hasAnyDoctorAvailableInDept && !hasAvailableSlots && (
                            <p className="text-xs text-red-700 font-semibold">{t.NO_TIME_SLOTS_AVAILABLE}</p>
                          )}

                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">{t.DOCTOR_AVAILABILITY_FOR_DATE}</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {(bookingAvailability.doctors || []).map((doc) => (
                                <div key={doc.id} className="bg-white border border-blue-100 rounded-md px-3 py-2">
                                  <p className="text-xs font-bold text-brand-blue">{doc.name}</p>
                                  <p className="text-[11px] text-gray-800">{t.DOCTOR_SCHEDULE_LABEL}: {doc.schedule || t.NOT_AVAILABLE}</p>
                                  <p className="text-[11px] text-gray-800">
                                    {t.TODAY_TIMINGS}: {doc.dayTiming || t.NOT_AVAILABLE}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-red-700">{t.NO_TIME_SLOTS_AVAILABLE}</p>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isBookingDisabled}
                        className={`w-full text-white py-4 rounded-lg font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 block ${isBookingDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-teal hover:bg-opacity-90 active:scale-95'}`}
                      >
                        {isSubmitting ? t.PROCESSING : t.BOOK_NOW}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Tracking Module */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center mb-1"><Search className="h-5 w-5 mr-2 text-brand-teal" /> {t.TRACK_APPT}</h3>
                  <p className="text-sm text-gray-800">{t.TRACK_HELP_TEXT}</p>
                </div>
                <div className="flex w-full md:w-auto">
                  <input
                    type="text"
                    placeholder={t.TRACKING_PLACEHOLDER}
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    className="border border-gray-300 rounded-l-md px-4 py-2 outline-none focus:border-brand-teal w-full md:w-48"
                  />
                  <button onClick={onTrackAppointment} className="bg-brand-blue text-white px-4 py-2 rounded-r-md font-medium hover:bg-opacity-90">{t.TRACK}</button>
                </div>
              </div>

              {trackResult && (
                <div className="mt-4 p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <span className="font-bold text-brand-blue">{trackResult.trackingId}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold">{trackResult.status}</span>
                  </div>
                  <p className="text-sm text-gray-800"><strong>{t.PATIENT_LABEL}:</strong> {trackResult.patient?.name}</p>
                  <p className="text-sm text-gray-800"><strong>{t.DEPT_LABEL}:</strong> {language === 'KN' ? deptMap[trackResult.department] || trackResult.department : trackResult.department}</p>
                  <p className="text-sm text-gray-800"><strong>{t.ASSIGNED_DOCTOR}:</strong> {trackResult.assignedDoctor?.name || t.NOT_AVAILABLE}</p>
                  <p className="text-sm text-gray-800"><strong>{t.TIME_LABEL}:</strong> {new Date(trackResult.date).toLocaleDateString()} {t.AT} {trackResult.time}</p>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* PG Doctor Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-800 text-white py-4 px-6 flex items-center">
                <Clock className="mr-3 h-5 w-5 text-brand-teal" />
                <h2 className="text-xl font-semibold">{t.PG_DOCTOR_SCHEDULE}</h2>
              </div>
              <div className="divide-y divide-gray-100 max-h-100 overflow-y-auto">
                {doctors.length > 0 ? doctors.map((doc, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-brand-blue text-sm uppercase tracking-normal">{doc.name}</h4>
                        <p className="text-xs text-gray-800 font-bold uppercase">{language === 'KN' ? deptMap[doc.specialty] || doc.specialty : doc.specialty}</p>
                        <p className="text-[11px] text-gray-800 mt-1">{t.DOCTOR_SCHEDULE_LABEL}: {doc.schedule}</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${doc.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                        {doc.status === 'Available' ? t.AVAILABLE : t.OFF_DUTY}
                      </div>
                    </div>
                  </div>
                )) : <div className="p-6 text-center text-gray-800">{t.LOADING_SCHEDULES}</div>}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientPortal;
