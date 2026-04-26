import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock3, FileText, UserRound, RefreshCw, Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import { translations, deptMap } from '../utils/translations';
import { useNotification } from '../context/NotificationContext';

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'In-Treatment': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
};

const PatientDashboard = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();
  const { showAlert } = useNotification();

  const [patient, setPatient] = useState(null);
  const [summary, setSummary] = useState({ total: 0, current: 0, past: 0 });
  const [currentAppointments, setCurrentAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pushStatus, setPushStatus] = useState('request'); // request, granted, denied

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const enableNotifications = async () => {
    const shouldProceed = window.confirm("Allow RRDCH to notify you when your turn is near?");
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
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
          });
        }
        
        const appt = currentAppointments.length > 0 ? currentAppointments[0] : {};
        
        await axios.post('http://localhost:5000/api/notifications/subscribe', {
          subscription,
          trackingId: appt.trackingId || null,
          department: appt.department || null
        }, authConfig);
        
        setPushStatus('granted');
        
        try {
          await axios.post('http://localhost:5000/api/notifications/test', {}, authConfig);
        } catch(e) { console.error('Ping failed', e); }
        
        alert("Success! Check your screen, a test notification was just sent!");
      } else {
        setPushStatus('denied');
        alert("Permission denied by your browser. Please check your browser's site settings and enable Notifications manually.");
      }
    } catch (err) {
      console.error("Failed to enable push notifications", err);
      alert(`Error enabling notifications: ${err.message || 'Unknown error'}. Check the developer console for more info.`);
    }
  };

  const token = sessionStorage.getItem('patientToken');

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const fetchDashboardData = async () => {
    if (!token) {
      navigate('/hospital-auth');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [profileRes, apptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/patients/me', authConfig),
        axios.get('http://localhost:5000/api/patients/my-appointments', authConfig)
      ]);

      setPatient(profileRes.data.patient || null);
      setSummary(apptRes.data.summary || { total: 0, current: 0, past: 0 });
      setCurrentAppointments(apptRes.data.currentAppointments || []);
      setPastAppointments(apptRes.data.pastAppointments || []);

      if (profileRes.data.patient) {
        sessionStorage.setItem('patientProfile', JSON.stringify(profileRes.data.patient));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard data.';
      setError(msg);

      if (err.response?.status === 401 || err.response?.status === 403) {
        sessionStorage.removeItem('patientToken');
        sessionStorage.removeItem('patientProfile');
        navigate('/hospital-auth');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentAppointments || currentAppointments.length === 0) return;
    
    const socket = io('http://localhost:5000');
    socket.on('queueUpdate', (data) => {
      currentAppointments.forEach(appt => {
        if (appt.department === data.department && appt.status === 'Pending' && appt.tokenNumber) {
          const curVal = Number(data.currentToken);
          if (!isNaN(curVal)) {
            if (appt.tokenNumber === curVal + 2) {
               showAlert("Queue Alert", `Your turn is soon! You are Token #${appt.tokenNumber}. Current token is ${curVal}. Please proceed to the ${data.department} department.`);
            } else if (appt.tokenNumber === curVal + 1) {
               showAlert("Queue Alert", `You are NEXT! You are Token #${appt.tokenNumber}. Please wait near the doctor's cabin in the ${data.department} department.`);
            } else if (appt.tokenNumber === curVal) {
               showAlert("Queue Alert", `It is Your Turn! Token #${appt.tokenNumber}. Head inside the ${data.department} department now!`);
            }
          }
        }
      });
    });

    return () => socket.disconnect();
  }, [currentAppointments, showAlert]);

  return (
    <div className="min-h-screen bg-brand-light py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-blue">{t.PATIENT_DASHBOARD}</h1>
            <p className="text-gray-800 mt-1">{t.PATIENT_DASHBOARD_SUB}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchDashboardData}
              className="inline-flex items-center px-4 py-2 rounded-md border border-brand-blue text-brand-blue bg-white font-semibold text-sm hover:bg-brand-light"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.REFRESH}
            </button>
            <button
              onClick={() => pushStatus === 'granted' ? axios.post('http://localhost:5000/api/notifications/test', {}, authConfig).then(()=>alert('Test notification requested!')).catch(e=>alert('Test failed:'+e.message)) : enableNotifications()}
              title="Enable Push Notifications"
              className={`inline-flex items-center px-4 py-2 rounded-md font-semibold text-sm transition-colors border ${pushStatus === 'granted' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              <Bell className={`w-4 h-4 mr-2 ${pushStatus === 'granted' ? 'text-green-500 fill-current' : ''}`} />
              {pushStatus === 'granted' ? 'Send Test Ping' : 'Get Alerted'}
            </button>
            <Link
              to="/patient-portal"
              className="inline-flex items-center px-4 py-2 rounded-md bg-brand-teal text-white font-semibold text-sm hover:bg-opacity-90"
            >
              {t.PATIENT_SERVICES}
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-800">
            {t.LOADING_DASHBOARD}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-brand-blue text-lg mb-4 inline-flex items-center">
                  <UserRound className="w-5 h-5 mr-2 text-brand-teal" />
                  {t.PATIENT_DETAILS}
                </h2>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-800">{t.PATIENT_LABEL}:</span> {patient?.name || '-'}</p>
                  <p><span className="font-semibold text-gray-800">{t.PATIENT_ID_LABEL}:</span> {patient?.patientId || '-'}</p>
                  <p><span className="font-semibold text-gray-800">{t.PHONE_NUMBER}:</span> {patient?.phone || '-'}</p>
                  <p><span className="font-semibold text-gray-800">{t.EMAIL_ADDRESS}:</span> {patient?.email || '-'}</p>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs uppercase tracking-wider text-gray-800 font-bold">{t.TOTAL_APPOINTMENTS}</p>
                  <p className="text-3xl font-bold text-brand-blue mt-1">{summary.total}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs uppercase tracking-wider text-gray-800 font-bold">{t.CURRENT_APPOINTMENTS}</p>
                  <p className="text-3xl font-bold text-brand-teal mt-1">{summary.current}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs uppercase tracking-wider text-gray-800 font-bold">{t.PAST_RECORDS}</p>
                  <p className="text-3xl font-bold text-gray-700 mt-1">{summary.past}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-brand-blue text-lg inline-flex items-center">
                    <Clock3 className="w-5 h-5 mr-2 text-brand-teal" />
                    {t.CURRENT_APPOINTMENTS}
                  </h3>
                </div>
                <div className="p-5 space-y-4 max-h-125 overflow-y-auto">
                  {currentAppointments.length === 0 ? (
                    <div className="text-sm text-gray-800 text-center py-6">{t.NO_CURRENT_APPOINTMENTS}</div>
                  ) : currentAppointments.map((appt) => (
                    <article key={appt._id} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-brand-blue text-sm">{language === 'KN' ? deptMap[appt.department] || appt.department : appt.department}</h4>
                          <p className="text-xs text-gray-800 mt-1">{t.TRACK}: {appt.trackingId}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full border text-xs font-bold uppercase ${statusStyles[appt.status] || statusStyles.Pending}`}>
                          {appt.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                        <p><span className="font-semibold">{t.PREFERRED_DATE}:</span> {new Date(appt.date).toLocaleDateString()}</p>
                        <p><span className="font-semibold">{t.PREFERRED_TIME}:</span> {appt.time}</p>
                        <p><span className="font-semibold">{t.ASSIGNED_DOCTOR}:</span> {appt.assignedDoctor?.name || t.NOT_AVAILABLE}</p>
                        <p><span className="font-semibold">{t.TOKEN_GIVEN}:</span> #{appt.tokenNumber || '--'}</p>
                        <p><span className="font-semibold">{t.STATUS}:</span> {appt.status}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-brand-blue text-lg inline-flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-brand-teal" />
                    {t.PAST_RECORDS}
                  </h3>
                </div>
                <div className="p-5 space-y-4 max-h-125 overflow-y-auto">
                  {pastAppointments.length === 0 ? (
                    <div className="text-sm text-gray-800 text-center py-6">{t.NO_PAST_RECORDS}</div>
                  ) : pastAppointments.map((appt) => (
                    <article key={appt._id} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-brand-blue text-sm">{language === 'KN' ? deptMap[appt.department] || appt.department : appt.department}</h4>
                          <p className="text-xs text-gray-800 mt-1">{t.TRACK}: {appt.trackingId}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full border text-xs font-bold uppercase ${statusStyles[appt.status] || statusStyles.Pending}`}>
                          {appt.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                        <p><span className="font-semibold">{t.PREFERRED_DATE}:</span> {new Date(appt.date).toLocaleDateString()}</p>
                        <p><span className="font-semibold">{t.PREFERRED_TIME}:</span> {appt.time}</p>
                        <p><span className="font-semibold">{t.ASSIGNED_DOCTOR}:</span> {appt.assignedDoctor?.name || t.NOT_AVAILABLE}</p>
                        <p><span className="font-semibold">{t.TOKEN_GIVEN}:</span> #{appt.tokenNumber || '--'}</p>
                        <p><span className="font-semibold">{t.STATUS}:</span> {appt.status}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-800 inline-flex items-center">
              <CalendarDays className="w-4 h-4 mr-2 text-brand-teal" />
              {t.DASHBOARD_NOTE}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
