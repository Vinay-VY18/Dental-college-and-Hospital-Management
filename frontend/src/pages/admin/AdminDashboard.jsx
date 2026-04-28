import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, BookOpen, Building, CheckCircle, XCircle, LogOut, Edit, Trash2, AlertTriangle, ArrowLeft, Bell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations, deptMap } from '../../utils/translations';

const AdminDashboard = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('clinical');
  const [doctors, setDoctors] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [admissions, setAdmissions] = useState([]);
  const [research, setResearch] = useState([]);
  const [events, setEvents] = useState([]);
  const [hospitalEvents, setHospitalEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [docForm, setDocForm] = useState({ name: '', specialty: '', schedule: '' });
  const [sylForm, setSylForm] = useState({ year: '', description: '', fileLink: '' });
  const [admForm, setAdmForm] = useState({ 
    department: '', 
    degree: 'BDS', 
    totalSeats: '', 
    availableSeats: '', 
    eligibility: '', 
    tuition: '', 
    hostel: '' 
  });
  const [resForm, setResForm] = useState({ title: '', authors: '', description: '', link: '' });
  const [evtForm, setEvtForm] = useState({ date: '', title: '', type: '' });
  const [hospEvtForm, setHospEvtForm] = useState({ date: '', title: '', type: '' });
  const [depForm, setDepForm] = useState({ name: '', hod: '', description: '', facultyCount: '' });
  const [facForm, setFacForm] = useState({ name: '', designation: '', department: 'Oral Surgery', experience: '', specialization: '', image: '' });
  
  // Modals state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, endpoint: '', id: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, endpoint: '', id: '', payload: {} });
  const [viewDept, setViewDept] = useState('Oral Surgery');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinicalSubTab, setClinicalSubTab] = useState('queue'); // 'queue' or 'staff'

  const navigate = useNavigate();
  const token = sessionStorage.getItem('adminToken');
  const adminRole = sessionStorage.getItem('adminRole') || 'SUPER_ADMIN';

  useEffect(() => {
    // 1. Authentication Guard
    if (!token) {
      navigate('/admin');
      return;
    }

    // 2. Inactivity Timeout (15 Minutes)
    let timeoutId;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, 15 * 60 * 1000); // 15 minutes
    };

    // 3. Multi-Tab Invalidation (Broadcast Channel)
    const authChannel = new BroadcastChannel('auth_channel');
    const currentTabId = sessionStorage.getItem('tabId');
    
    authChannel.onmessage = (e) => {
      // Only logout if the message comes from a DIFFERENT tab than this one
      if (e.data.type === 'LOGIN' && e.data.source !== currentTabId) {
        handleLogout();
      }
    };

    // Listen for activity to reset the inactivity timer
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    // Set default tab safely based on role
    if (adminRole === 'ADMIN_ACADEMIC') setActiveTab('academic');
    else if (adminRole === 'ADMIN_COLLEGE') setActiveTab('college');
    else if (adminRole === 'ADMIN_HOSTEL') setActiveTab('hostel');
    else setActiveTab('clinical');
    
    fetchData();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      authChannel.close();
    };
  }, [token, navigate, adminRole]);

  const fetchData = async () => {
    // Helper to fetch and set state safely
    const safeFetch = async (url, setter, headerObj = {}) => {
      try {
        const res = await axios.get(url, headerObj);
        console.log(`Data from ${url}:`, res.data); // Debug log
        setter(res.data.doctors || res.data.appointments || res.data.complaints || res.data || []);
      } catch (err) {
        console.error(`Fetch failed for ${url}:`, err.message);
      }
    };

    const deptParam = encodeURIComponent(viewDept || 'General Checkup');
    const dateParam = encodeURIComponent(viewDate || new Date().toISOString().split('T')[0]);

    safeFetch('http://localhost:5000/api/doctors', setDoctors);
    safeFetch(`http://localhost:5000/api/patients/admin/all?dept=${deptParam}&date=${dateParam}`, setAppointments, { headers: { Authorization: `Bearer ${token}` }});
    safeFetch('http://localhost:5000/api/academics/syllabus', setSyllabus);
    safeFetch('http://localhost:5000/api/admissions', setAdmissions);
    safeFetch('http://localhost:5000/api/college/research', setResearch);
    safeFetch('http://localhost:5000/api/college/calendar', setEvents);
    safeFetch('http://localhost:5000/api/college/hospital-events', setHospitalEvents);
    safeFetch('http://localhost:5000/api/academics/departments', setDepartments);
    safeFetch('http://localhost:5000/api/admin/hostel/complaints', setComplaints, { headers: { Authorization: `Bearer ${token}` }});
    safeFetch('http://localhost:5000/api/college/faculty', setFaculty);
  };

  useEffect(() => {
    if (activeTab === 'clinical') fetchData();
  }, [viewDept, viewDate, activeTab]);

  const updateDoctorStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/doctors/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` }});
      setDoctors(prev => prev.map(d => d._id === id ? { ...d, status } : d));
    } catch (err) {
      alert('Failed to update doctor status');
    }
  };

  const updateApptStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/patients/admin/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` }});
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) { alert('Failed to update appointment status'); }
  };

  const updateComplaintStatus = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/hostel/complaints/${id}`, {}, { headers: { Authorization: `Bearer ${token}` }});
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: 'Solved' } : c));
    } catch (err) { alert('Failed to update complaint status'); }
  };

  const submitDocForm = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/doctors', docForm, { headers: { Authorization: `Bearer ${token}` }});
      setDocForm({ name: '', specialty: '', schedule: '' });
      fetchData();
    } catch (err) { alert('Failed to add doctor'); }
  };

  const submitContent = async (path, payload, resetFn) => {
    try {
      console.log(`Submitting to ${path}:`, payload);
      const res = await axios.post(`http://localhost:5000/api/${path}`, payload, { headers: { Authorization: `Bearer ${token}` }});
      console.log('Success response:', res.data);
      resetFn();
      fetchData();
      alert(`Added successfully!`);
    } catch (err) {
      console.error(`Error posting to ${path}:`, err.response?.data || err.message);
      alert(`Failed to add: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleFacultyPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas and compress image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to compress image (max 800x800)
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP or PNG with compression
        const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Image compressed:', compressedImage.length, 'bytes');
        setFacForm({ ...facForm, image: compressedImage });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/${deleteModal.endpoint}/${deleteModal.id}`, { headers: { Authorization: `Bearer ${token}` }});
      
      const filterFn = (prev) => prev.filter(i => i._id !== deleteModal.id);

      // Dynamic State Setter Mapping
      const setterMap = {
        'doctors': setDoctors,
        'patients/admin': setAppointments,
        'academics/syllabus': setSyllabus,
        'admissions': setAdmissions,
        'college/research': setResearch,
        'college/events': setEvents,
        'college/hospital-events': setHospitalEvents,
        'academics/departments': setDepartments,
        'admin/hostel/complaints': setComplaints,
        'college/faculty': setFaculty
      };

      if (setterMap[deleteModal.endpoint]) {
        setterMap[deleteModal.endpoint](filterFn);
      }

      setDeleteModal({ isOpen: false, endpoint: '', id: '' });
    } catch (err) { alert('Failed to delete item.'); }
  };

  const executeEdit = async (e) => {
    e.preventDefault();
    try {
      // Clean payload: remove immutable metadata fields
      const { _id, __v, createdAt, updatedAt, ...cleanPayload } = editModal.payload;
      
      const res = await axios.put(
        `http://localhost:5000/api/${editModal.endpoint}/${editModal.id}`, 
        cleanPayload, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Determine the result data (sometimes nested in generic response)
      const updatedItem = res.data.doctor || res.data.appointment || res.data.complaint || res.data.event || res.data;
      
      const mapFn = (i) => i._id === editModal.id ? { ...i, ...updatedItem } : i;

      const setterMap = {
        'doctors': setDoctors,
        'patients/admin': setAppointments,
        'academics/syllabus': setSyllabus,
        'admissions': setAdmissions,
        'college/research': setResearch,
        'college/events': setEvents,
        'college/hospital-events': setHospitalEvents,
        'academics/departments': setDepartments,
        'admin/hostel/complaints': setComplaints,
        'college/faculty': setFaculty
      };

      if (setterMap[editModal.endpoint]) {
        setterMap[editModal.endpoint](prev => prev.map(mapFn));
      }

      setEditModal({ isOpen: false, endpoint: '', id: '', payload: {} });
    } catch (err) { 
      console.error(err);
      alert('Failed to update item: ' + (err.response?.data?.message || err.message)); 
    }
  };

  const callNext = async (dept) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/patients/admin/next/${encodeURIComponent(dept)}`,
        { date: viewDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      alert('Failed to call next patient: ' + (err.response?.data?.message || err.message));
    }
  };

  const confirmDelete = (endpoint, id) => {
    setDeleteModal({ isOpen: true, endpoint, id });
  };

  const openEdit = (endpoint, id, payload) => {
    setEditModal({ isOpen: true, endpoint, id, payload });
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch(e) {}
    sessionStorage.clear();
    localStorage.removeItem('adminToken'); // Ensure old storage is also clean
    navigate('/admin');
  };

  const canModify = (tab) => {
    if (adminRole === 'SUPER_ADMIN' || adminRole === 'GLOBAL_ADMIN') return true;
    const roleMap = {
      'clinical': 'ADMIN_CLINIC',
      'academic': 'ADMIN_ACADEMIC',
      'college': 'ADMIN_COLLEGE',
      'hostel': 'ADMIN_HOSTEL'
    };
    return adminRole === roleMap[tab] || adminRole === 'SUPER_ADMIN';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">{t.CONFIRM_DELETE}</h3>
            <p className="text-gray-800 mb-8 text-center text-sm leading-relaxed font-medium">
              Are you sure you want to permanently delete this record? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDelete} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all uppercase tracking-widest text-xs">{t.DELETE}</button>
              <button onClick={() => setDeleteModal({isOpen:false})} className="w-full bg-gray-50 text-gray-800 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all text-xs">{t.CANCEL}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h3 className="text-xl font-bold text-brand-blue mb-4">Edit Record</h3>
            <form onSubmit={executeEdit} className="space-y-3">
              {Object.keys(editModal.payload).filter(k => k !== '_id' && k !== '__v' && k !== 'createdAt' && k !== 'updatedAt').map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{key}</label>
                  <input
                    type="text"
                    value={editModal.payload[key] || ''}
                    onChange={(e) => setEditModal({...editModal, payload: {...editModal.payload, [key]: e.target.value}})}
                    className="w-full border border-gray-300 p-2 rounded focus:border-brand-teal outline-none"
                  />
                </div>
              ))}
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setEditModal({isOpen:false})} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-teal text-white py-2 rounded font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-brand-blue text-white shadow-xl flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 border-b border-brand-teal border-opacity-30 shrink-0">
          <h2 className="text-xl font-bold flex items-center"><Activity className="mr-2" /> Admin Root</h2>
          <p className="text-brand-light opacity-90 text-sm mt-1">Control Center</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {(adminRole === 'SUPER_ADMIN' || adminRole === 'GLOBAL_ADMIN' || adminRole === 'ADMIN_CLINIC') && (
            <button onClick={() => setActiveTab('clinical')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'clinical' ? 'bg-brand-teal shadow-lg' : 'hover:bg-white hover:text-brand-blue'}`}>
              <Users className="mr-3 h-5 w-5" /> {t.CLINICAL_MGMT}
            </button>
          )}
          {(adminRole === 'SUPER_ADMIN' || adminRole === 'GLOBAL_ADMIN' || adminRole === 'ADMIN_ACADEMIC') && (
            <button onClick={() => setActiveTab('academic')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'academic' ? 'bg-brand-teal shadow-lg' : 'hover:bg-white hover:text-brand-blue'}`}>
              <BookOpen className="mr-3 h-5 w-5" /> {t.ACADEMIC_MGMT}
            </button>
          )}
          {(adminRole === 'SUPER_ADMIN' || adminRole === 'GLOBAL_ADMIN' || adminRole === 'ADMIN_COLLEGE') && (
            <button onClick={() => setActiveTab('college')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'college' ? 'bg-brand-teal shadow-lg' : 'hover:bg-white hover:text-brand-blue'}`}>
              <Building className="mr-3 h-5 w-5" /> {t.COLLEGE_MGMT}
            </button>
          )}
          {(adminRole === 'SUPER_ADMIN' || adminRole === 'GLOBAL_ADMIN' || adminRole === 'ADMIN_HOSTEL') && (
            <button onClick={() => setActiveTab('hostel')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'hostel' ? 'bg-brand-teal shadow-lg' : 'hover:bg-white hover:text-brand-blue'}`}>
              <CheckCircle className="mr-3 h-5 w-5" /> {t.HOSTEL_PORTAL}
            </button>
          )}
        </nav>
        <div className="p-4 border-t border-brand-teal border-opacity-30 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center text-red-300 hover:text-red-100 px-4 py-2 opacity-90 transition-colors bg-white/20 rounded">
            <LogOut className="mr-2 h-4 w-4" /> {t.LOGOUT}
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-10 overflow-y-auto w-full">
        {/* Real-time Insights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
           <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-brand-teal">
              <div className="text-xs font-bold text-gray-800 uppercase">{t.LIVE_APPOINTMENTS}</div>
              <div className="text-2xl font-bold text-brand-blue">{appointments.length}</div>
           </div>
           <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-brand-blue">
              <div className="text-xs font-bold text-gray-800 uppercase">{t.ACADEMIC_FACULTY}</div>
              <div className="text-2xl font-bold text-brand-blue">{faculty.length}</div>
           </div>
           <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-indigo-500">
              <div className="text-xs font-bold text-gray-800 uppercase">{t.RESEARCH_PROJECTS}</div>
              <div className="text-2xl font-bold text-brand-blue">{research.length}</div>
           </div>
           <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-500">
              <div className="text-xs font-bold text-gray-800 uppercase">{t.ACTIVE_EVENTS}</div>
              <div className="text-2xl font-bold text-brand-blue">{events.length}</div>
           </div>
        </div>

        {/* Emergency Broadcast Panel */}
        <div className="bg-brand-blue text-white p-6 rounded-3xl shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b-8 border-brand-teal">
          <div className="flex-1">
            <h3 className="text-xl font-bold flex items-center"><Bell className="mr-3 animate-pulse" /> Emergency Broadcast</h3>
            <p className="text-brand-light opacity-80 text-sm">Send a high-priority alert to all active patients currently using the portal.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              id="broadcastInput"
              type="text" 
              placeholder="Enter message..." 
              className="bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-sm w-full md:w-80 outline-none focus:bg-white/30"
            />
            <button 
              onClick={async () => {
                const msg = document.getElementById('broadcastInput').value;
                if (!msg) return alert('Enter a message');
                try {
                  await axios.post('http://localhost:5000/api/notifications/broadcast', { title: 'Health Alert', message: msg }, { headers: { Authorization: `Bearer ${token}` }});
                  alert('Broadcast sent!');
                  document.getElementById('broadcastInput').value = '';
                } catch(e) { alert('Failed: ' + e.message); }
              }}
              className="bg-white text-brand-blue px-6 py-2 rounded-xl font-bold text-sm hover:bg-brand-teal hover:text-white transition-all shadow-lg"
            >
              BROADCAST
            </button>
          </div>
        </div>
        
        {activeTab === 'clinical' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Go back">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Clinical Management</h1>
                  <p className="text-gray-800">Manage online appointments queue and doctor availability.</p>
                </div>
              </div>
              <div className="bg-brand-blue text-white px-6 py-3 rounded-xl shadow-lg flex items-center">
                <Users className="mr-3" />
                <div>
                  <div className="text-xs uppercase font-bold opacity-90">Current Queue</div>
                  <div className="text-lg font-bold">{viewDept}</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 mb-8 bg-gray-100 p-1 rounded-lg w-max shadow-inner">
              {['Oral Surgery', 'Orthodontics', 'Prosthodontics', 'Periodontics', 'General Checkup'].map(dept => (
                <button 
                  key={dept} 
                  onClick={() => setViewDept(dept)}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewDept === dept ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-800 hover:bg-teal-600 hover:text-white'}`}
                >
                  {language === 'KN' ? deptMap[dept] || dept : dept}
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between mb-8 bg-gray-100 p-1.5 rounded-xl w-max shadow-inner">
               <button onClick={() => setClinicalSubTab('queue')} className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${clinicalSubTab === 'queue' ? 'bg-white text-brand-blue shadow-md' : 'text-gray-800 hover:bg-teal-600 hover:text-white'}`}>
                 <Users className="mr-2 h-4 w-4" /> {language === 'KN' ? "ಸರತಿ ಸಾಲು" : "Patient Queue"}
               </button>
               <button onClick={() => setClinicalSubTab('staff')} className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${clinicalSubTab === 'staff' ? 'bg-white text-brand-blue shadow-md' : 'text-gray-800 hover:bg-teal-600 hover:text-white'}`}>
                 <Activity className="mr-2 h-4 w-4" /> {language === 'KN' ? "ಸಿಬ್ಬಂದಿ ನಿರ್ವಹಣೆ" : "Staff Management"}
               </button>
            </div>

            {clinicalSubTab === 'staff' ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-brand-blue text-white px-6 py-4 flex items-center justify-between">
                    <h3 className="font-bold flex items-center">PG Doctor Availability Tracker: {viewDept}</h3>
                  </div>
                  <div className="p-6">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-800">
                        <tr><th className="p-3">Doctor Name</th><th className="p-3">Specialty</th><th className="p-3">Live Status</th><th className="p-3">Actions</th></tr>
                      </thead>
                      <tbody>
                        {doctors.filter(d => d.specialty === viewDept).map(doc => (
                          <tr key={doc._id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{doc.name}</td>
                            <td className="p-3 text-gray-800 font-bold text-xs uppercase">{doc.specialty}</td>
                            <td className="p-3">
                              <select 
                                value={doc.status} 
                                onChange={(e) => updateDoctorStatus(doc._id, e.target.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all outline-none ${doc.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200 focus:border-green-400' : 'bg-gray-100 text-gray-800 border-gray-200 focus:border-gray-400'}`}
                              >
                                <option value="Available">🟢 Available</option>
                                <option value="Off-Duty">💤 Off-Duty</option>
                              </select>
                            </td>
                            <td className="p-3 flex space-x-2">
                               {canModify('clinical') && (
                                 <>
                                   <button onClick={() => openEdit('doctors', doc._id, doc)} className="p-1.5 text-brand-blue hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                                   <button onClick={() => confirmDelete('doctors', doc._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                 </>
                               )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-brand-blue mb-4">Register New PG Doctor ({viewDept})</h3>
                  <form onSubmit={submitDocForm} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Name" value={docForm.name} onChange={e=>setDocForm({...docForm, name: e.target.value})} className="border p-2 rounded outline-none focus:border-brand-teal" required />
                    <select value={docForm.specialty} onChange={e=>setDocForm({...docForm, specialty: e.target.value})} className="border p-2 rounded outline-none focus:border-brand-teal bg-white font-bold" required>
                      <option value="">-- Speciality --</option>
                      <option value="Oral Surgery">Oral Surgery</option>
                      <option value="Orthodontics">Orthodontics</option>
                      <option value="Prosthodontics">Prosthodontics</option>
                      <option value="General Checkup">General Checkup</option>
                    </select>
                    <input type="text" placeholder="Schedule" value={docForm.schedule} onChange={e=>setDocForm({...docForm, schedule: e.target.value})} className="border p-2 rounded outline-none focus:border-brand-teal" required />
                    <button type="submit" className="bg-brand-blue text-white rounded font-medium shadow hover:bg-opacity-90">Add Doctor</button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-sm border border-brand-teal overflow-hidden">
                  <div className="bg-brand-teal text-white px-6 py-4 flex items-center justify-between">
                    <h3 className="font-bold flex items-center">Control Panel: {viewDept}</h3>
                    <button onClick={() => callNext(viewDept)} className="bg-white text-brand-teal px-6 py-2 rounded-full font-bold text-xs hover:bg-gray-100 shadow-lg border-2 border-white transition-all transform hover:scale-105">FINISH & CALL NEXT</button>
                  </div>
                </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8 w-full max-w-full">
              <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold flex items-center">{language === 'KN' ? "ರೋಗಿಗಳ ನೇಮಕಾತಿ ಸಾಲು" : "Patient Appointments Queue"}</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-gray-800">FILTER BY DATE:</span>
                  <input 
                    type="date" 
                    value={viewDate}
                    onChange={(e) => setViewDate(e.target.value)}
                    className="bg-gray-700 text-white border-none rounded px-3 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                {appointments.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-gray-800 text-lg font-bold">No appointments scheduled for {new Date(viewDate).toLocaleDateString()}.</div>
                    <p className="text-gray-800 text-sm mt-1">Select a different date or department to view other queues.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-800">
                    <tr><th className="p-3">Token</th><th className="p-3">Patient</th><th className="p-3">Dept</th><th className="p-3">Doctor</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
                  </thead>
                  <tbody>
                    {appointments.map(appt => (
                      <tr key={appt._id} className={`border-b hover:bg-gray-50 ${appt.status === 'In-Treatment' ? 'bg-brand-light font-semibold' : ''}`}>
                        <td className="p-3 font-bold text-brand-blue">#{appt.tokenNumber || '---'}</td>
                        <td className="p-3">
                          <div className="font-medium flex items-center">
                            {appt.patient?.name}
                            {appt.hasPush && <Activity className="w-4 h-4 text-green-500 ml-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] rounded-full animate-pulse" title="Notification Active" />}
                          </div>
                          <div className="text-xs text-gray-800">{appt.patient?.phone}</div>
                        </td>
                        <td className="p-3 text-xs uppercase font-bold text-gray-800">{appt.department}</td>
                        <td className="p-3 text-sm font-semibold text-brand-blue">{appt.assignedDoctor?.name || 'Unassigned'}</td>
                        <td className="p-3">
                           <select value={appt.status} onChange={(e) => updateApptStatus(appt._id, e.target.value)} className={`border p-1 rounded font-semibold outline-none ${appt.status === 'Pending' ? 'text-blue-600' : appt.status === 'In-Treatment' ? 'text-yellow-600' : appt.status === 'Completed' ? 'text-green-600' : 'text-red-600'}`}>
                             <option value="Pending">Pending</option>
                             <option value="In-Treatment">In-Treatment</option>
                             <option value="Completed">Completed</option>
                             <option value="Cancelled">Cancelled</option>
                           </select>
                        </td>
                        <td className="p-3 flex space-x-2">
                           {canModify('clinical') && (
                             <>
                               <button onClick={() => openEdit('patients/admin', appt._id, { date: new Date(appt.date).toISOString().split('T')[0], time: appt.time })} className="p-1.5 text-brand-blue hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                               <button onClick={() => confirmDelete('patients/admin', appt._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                             </>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>

            {/* Hospital Events Calendar Manager */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
              <h3 className="font-bold text-brand-blue mb-4 flex justify-between items-center text-lg">Hospital Calendar of Events <span className="text-xs bg-brand-blue text-white px-2 py-1 rounded">{hospitalEvents.length}</span></h3>
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
                {hospitalEvents.map(evt => (
                  <div key={evt._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-white border hover:border-brand-blue transition-all group">
                    <div>
                      <span className="text-xs font-bold text-brand-blue block">{evt.date}</span>
                      <span className="text-sm font-bold text-gray-700 truncate">{evt.title}</span>
                    </div>
                    {canModify('clinical') && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => openEdit('college/hospital-events', evt._id, evt)} className="p-1 text-brand-blue hover:bg-blue-100 rounded" title="Edit"><Edit className="w-3 h-3" /></button>
                        <button type="button" onClick={() => confirmDelete('college/hospital-events', evt._id)} className="p-1 text-red-500 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {canModify('clinical') && (
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (!hospEvtForm.date || !hospEvtForm.title || !hospEvtForm.type) {
                    alert('Please fill all fields');
                    return;
                  }
                  submitContent('college/hospital-events', hospEvtForm, () => setHospEvtForm({date:'', title:'', type:''})); 
                }} className="space-y-2 border-t pt-4">
                  <input type="text" placeholder="Date (e.g. 15 Apr)" value={hospEvtForm.date} onChange={e=>setHospEvtForm({...hospEvtForm, date: e.target.value})} className="w-full border p-3 rounded-xl text-sm focus:border-brand-blue outline-none" required />
                  <input type="text" placeholder="Event Title (e.g. Health Camp)" value={hospEvtForm.title} onChange={e=>setHospEvtForm({...hospEvtForm, title: e.target.value})} className="w-full border p-3 rounded-xl text-sm focus:border-brand-blue outline-none" required />
                  <select value={hospEvtForm.type} onChange={e=>setHospEvtForm({...hospEvtForm, type: e.target.value})} className="w-full border p-3 rounded-xl text-sm bg-white font-bold focus:border-brand-blue outline-none" required>
                    <option value="">Select Event Type</option>
                    <option value="OutreachCamp">Outreach Camp</option>
                    <option value="Training">Staff Training</option>
                    <option value="ClinicalWorkshop">Clinical Workshop</option>
                    <option value="CommunityProgram">Community Program</option>
                    <option value="HospitalEvent">Hospital Event</option>
                  </select>
                  <button type="submit" className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all">Add Hospital Event</button>
                </form>
              )}
            </div>

              </div>
            )}
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Go back">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Academics</h1>
                <p className="text-gray-800">Syllabus manager and clinical schedule adjustments.</p>
              </div>
            </div>
            
             <div className="grid grid-cols-1 gap-6 mt-6">

               <div className="bg-white rounded-xl shadow-sm border-t-4 border-brand-teal p-6">
                 <h3 className="font-bold text-brand-teal mb-4 text-xl flex justify-between">Manage Departments <span className="text-xs bg-brand-teal text-white px-2 py-1 rounded">{departments.length}</span></h3>
                 <div className="grid grid-cols-1 mb-6 gap-3 max-h-64 overflow-y-auto">
                   {departments.map(dep => (
                     <div key={dep._id} className="border p-3 rounded flex justify-between items-start bg-gray-50">
                       <div>
                         <h4 className="font-bold text-sm text-gray-800">{dep.name} <span className="font-normal text-xs text-gray-800 ml-1">({dep.facultyCount} Faculty)</span></h4>
                         <p className="text-xs text-gray-800 mt-1">HOD: {dep.hod}</p>
                       </div>
                       <div className="flex shrink-0 ml-2">
                         {canModify('academic') && (
                           <>
                             <button onClick={() => openEdit('academics/departments', dep._id, dep)} className="p-1.5 text-brand-blue hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                             <button onClick={() => confirmDelete('academics/departments', dep._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                           </>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
                 <form onSubmit={(e) => { e.preventDefault(); submitContent('academics/departments', depForm, () => setDepForm({ name: '', hod: '', description: '', facultyCount: '' })); }} className="border-t pt-4">
                   <div className="grid grid-cols-2 gap-2 mb-2">
                     <input type="text" placeholder="Department Name" value={depForm.name} onChange={e=>setDepForm({...depForm, name: e.target.value})} className="border p-2 rounded" required />
                     <input type="text" placeholder="HOD Name" value={depForm.hod} onChange={e=>setDepForm({...depForm, hod: e.target.value})} className="border p-2 rounded" required />
                   </div>
                   <input type="number" placeholder="Faculty Count" value={depForm.facultyCount} onChange={e=>setDepForm({...depForm, facultyCount: e.target.value})} className="w-full border p-2 rounded mb-2" required />
                   <textarea placeholder="Description" value={depForm.description} onChange={e=>setDepForm({...depForm, description: e.target.value})} className="w-full border p-2 rounded mb-2" rows="2" required></textarea>
                   <button type="submit" className="w-full bg-brand-teal text-white px-4 py-2 rounded font-bold hover:bg-opacity-90">Add Department</button>
                 </form>
               </div>

              {/* Admission Manager moved to Academics */}
              <div className="bg-white rounded-xl shadow-sm border-t-4 border-brand-blue p-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-brand-blue text-xl">Departmental Admission Slots</h3>
                  <span className="bg-brand-blue text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">{admissions.length} Slots Defined</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-h-100 overflow-y-auto pr-2">
                  {admissions.map(adm => (
                    <div key={adm._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm relative group hover:border-brand-teal transition-all">
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {canModify('academic') && (
                           <>
                             <button onClick={() => openEdit('admissions', adm._id, adm)} className="p-1.5 bg-white text-brand-blue rounded-md shadow-sm border hover:bg-blue-50"><Edit className="w-3.5 h-3.5" /></button>
                             <button onClick={() => confirmDelete('admissions', adm._id)} className="p-1.5 bg-white text-red-500 rounded-md shadow-sm border hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                           </>
                         )}
                      </div>
                      <div className="text-xs font-bold text-brand-teal uppercase mb-1">{adm.degree}</div>
                      <h4 className="font-bold text-gray-800 text-lg mb-2">{adm.department}</h4>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white p-2 rounded-lg border text-center">
                          <div className="text-xs text-gray-800 font-bold uppercase">Total</div>
                          <div className="font-bold text-brand-blue">{adm.totalSeats}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border text-center">
                          <div className="text-xs text-gray-800 font-bold uppercase">Left</div>
                          <div className="font-bold text-red-500">{adm.availableSeats}</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-gray-800 uppercase">Fees Breakdown</div>
                      <div className="text-xs text-gray-800">T: ₹{adm.feeStructure?.tuition?.toLocaleString()} | H: ₹{adm.feeStructure?.hostel?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-brand-light p-8 rounded-3xl border border-blue-50 shadow-inner">
                  <h4 className="font-bold text-brand-blue mb-6 text-xl">Define New Admission Slot</h4>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    const payload = {
                      department: admForm.department,
                      degree: admForm.degree,
                      totalSeats: Number(admForm.totalSeats),
                      availableSeats: Number(admForm.availableSeats),
                      eligibility: admForm.eligibility.split('\n').filter(s => s.trim()),
                      feeStructure: {
                        tuition: Number(admForm.tuition),
                        hostel: Number(admForm.hostel)
                      }
                    };
                    submitContent('admissions', payload, () => setAdmForm({ department: '', degree: 'BDS', totalSeats: '', availableSeats: '', eligibility: '', tuition: '', hostel: '' })); 
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-brand-blue uppercase mb-2">Program Department</label>
                          <select value={admForm.department} onChange={e=>setAdmForm({...admForm, department: e.target.value})} className="w-full border-2 border-white p-3 rounded-2xl shadow-sm outline-none bg-white font-bold focus:border-brand-teal transition-all" required>
                            <option value="">-- Select Dept --</option>
                            {['Oral Surgery', 'Orthodontics', 'Prosthodontics', 'Periodontics', 'Conservative Dentistry', 'Oral Pathology', 'Public Health Dentistry', 'Pedodontics', 'Oral Medicine'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-blue uppercase mb-2">Degree Type</label>
                          <select value={admForm.degree} onChange={e=>setAdmForm({...admForm, degree: e.target.value})} className="w-full border-2 border-white p-3 rounded-2xl shadow-sm outline-none bg-white font-bold focus:border-brand-teal transition-all" required>
                            <option value="BDS">BDS Program</option>
                            <option value="MDS">MDS Program</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-brand-blue uppercase mb-2">Total Seats</label>
                            <input type="number" value={admForm.totalSeats} onChange={e=>setAdmForm({...admForm, totalSeats: e.target.value})} className="w-full border-2 border-white p-3 rounded-2xl shadow-sm" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-brand-blue uppercase mb-2">Available</label>
                            <input type="number" value={admForm.availableSeats} onChange={e=>setAdmForm({...admForm, availableSeats: e.target.value})} className="w-full border-2 border-white p-3 rounded-2xl shadow-sm" required />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-brand-blue uppercase mb-2">Tuition Fee</label>
                            <input type="number" value={admForm.tuition} onChange={e=>setAdmForm({...admForm, tuition: e.target.value})} className="w-full border-2 border-white p-3 rounded-2xl shadow-sm" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-brand-blue uppercase mb-2">Hostel Fee</label>
                            <input type="number" value={admForm.hostel} onChange={e=>setAdmForm({...admForm, hostel: e.target.value})} className="w-full border-2 border-white p-3 rounded-2xl shadow-sm" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-blue uppercase mb-2">Eligibility (one per line)</label>
                          <textarea value={admForm.eligibility} onChange={e=>setAdmForm({...admForm, eligibility: e.target.value})} className="w-full border-2 border-white p-3 rounded-2xl shadow-sm min-h-30" required></textarea>
                        </div>
                        <button type="submit" className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-brand-teal transform hover:scale-[1.02] transition-all mt-2 uppercase tracking-widest text-sm">Initiate Admission Slot</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
             </div>
          </div>
        )}

        {activeTab === 'college' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Go back">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">College Section</h1>
                <p className="text-gray-800">Manage admissions, research, events, curriculum, and all site editor publishing tools from one place.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Infrastructure Management (Research & Events) */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 pt-6">
                <h2 className="text-2xl font-bold text-brand-blue mb-8 border-b pb-4">Infrastructure Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Research Section */}
                  <div className="bg-white p-6 rounded-2xl border-2 border-brand-teal border-opacity-10">
                    <h3 className="font-bold text-brand-teal mb-4 flex justify-between items-center text-lg">Research Index <span className="text-xs bg-brand-teal text-white px-2 py-1 rounded">{research.length}</span></h3>
                    <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
                      {research.map(rsh => (
                        <div key={rsh._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-white border hover:border-brand-teal transition-all group">
                          <div className="flex-1">
                            <span className="text-sm font-bold text-gray-700 block truncate">{rsh.title}</span>
                            {rsh.link && <a href={rsh.link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-teal hover:underline break-all">{rsh.link}</a>}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                             <button onClick={() => openEdit('college/research', rsh._id, rsh)} className="p-1 text-brand-blue"><Edit className="w-3 h-3" /></button>
                             <button onClick={() => confirmDelete('college/research', rsh._id)} className="p-1 text-red-500"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); if (!resForm.title || !resForm.authors || !resForm.description) { alert('Please fill all fields'); return; } submitContent('college/research', resForm, () => setResForm({title:'', authors:'', description:'', link:''})); }} className="space-y-2">
                      <input type="text" placeholder="Title" value={resForm.title} onChange={e=>setResForm({...resForm, title: e.target.value})} className="w-full border p-3 rounded-xl text-sm focus:border-brand-teal outline-none" required />
                      <input type="text" placeholder="Authors" value={resForm.authors} onChange={e=>setResForm({...resForm, authors: e.target.value})} className="w-full border p-3 rounded-xl text-sm focus:border-brand-teal outline-none" required />
                      <textarea placeholder="Description" value={resForm.description} onChange={e=>setResForm({...resForm, description: e.target.value})} className="w-full border p-3 rounded-xl text-sm focus:border-brand-teal outline-none" rows="3" required />
                      <input type="url" placeholder="Research Link (e.g., https://...)" value={resForm.link} onChange={e=>setResForm({...resForm, link: e.target.value})} className="w-full border p-3 rounded-xl text-sm focus:border-brand-teal outline-none" />
                      <button type="submit" className="w-full bg-brand-teal text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all">Index Publication</button>
                    </form>
                  </div>

                  {/* Events Section */}
                  <div className="bg-white p-6 rounded-2xl border-2 border-blue-100">
                    <h3 className="font-bold text-blue-500 mb-4 flex justify-between items-center text-lg">Calendar of Events <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">{events.length}</span></h3>
                    <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
                      {events.map(evt => (
                        <div key={evt._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-white border hover:border-blue-200 transition-all group">
                          <div>
                            <span className="text-xs font-bold text-blue-400 block">{evt.date}</span>
                            <span className="text-sm font-bold text-gray-700 truncate">{evt.title}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => openEdit('college/events', evt._id, evt)} className="p-1 text-brand-blue"><Edit className="w-3 h-3" /></button>
                             <button onClick={() => confirmDelete('college/events', evt._id)} className="p-1 text-red-500"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); submitContent('college/events', evtForm, () => setEvtForm({date:'', title:'', type:''})); }} className="space-y-2">
                      <input type="text" placeholder="Date (15 Apr)" value={evtForm.date} onChange={e=>setEvtForm({...evtForm, date: e.target.value})} className="w-full border p-3 rounded-xl text-sm" required />
                      <input type="text" placeholder="Event Title" value={evtForm.title} onChange={e=>setEvtForm({...evtForm, title: e.target.value})} className="w-full border p-3 rounded-xl text-sm" required />
                      <select value={evtForm.type} onChange={e=>setEvtForm({...evtForm, type: e.target.value})} className="w-full border p-3 rounded-xl text-sm bg-white font-bold" required>
                        <option value="">Select Event Type</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Social Service">Social Service</option>
                        <option value="Sports">Sports</option>
                        <option value="Academic">Academic</option>
                        <option value="Cultural">Cultural</option>
                      </select>
                      <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">Publish Event</button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Faculty Directory Manager (migrated from Site Editor) */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 pt-6">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                  <h2 className="text-2xl font-bold text-brand-blue">Faculty Directory Manager</h2>
                  <span className="bg-brand-teal text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest">{faculty.length} Profiles</span>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {faculty.map(f => (
                      <div key={f._id} className="bg-gray-50 p-4 rounded-2xl border flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {f.image ? (
                            <img src={f.image} alt={f.name} className="w-12 h-12 rounded-xl object-cover border border-indigo-100 bg-white" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                              <Users className="w-5 h-5 text-indigo-300" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-brand-blue">{f.name}</div>
                            <div className="text-xs font-bold text-indigo-500 uppercase">{f.designation} | {f.department}</div>
                          </div>
                        </div>
                        {canModify('college') && (
                          <div className="flex gap-1">
                            <button onClick={() => openEdit('college/faculty', f._id, f)} className="p-2 bg-white rounded-lg shadow-sm border text-brand-blue hover:bg-indigo-50"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => confirmDelete('college/faculty', f._id)} className="p-2 bg-white rounded-lg shadow-sm border text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {canModify('college') && (
                    <div className="bg-brand-blue p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Users className="w-32 h-32" /></div>
                      <h3 className="text-xl font-bold mb-6 relative z-10">Publish Faculty Profile</h3>
                      <form onSubmit={(e) => { e.preventDefault(); submitContent('college/faculty', facForm, () => setFacForm({ name: '', designation: '', department: 'Oral Surgery', experience: '', specialization: '', image: '' })); }} className="space-y-4 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Full Name" value={facForm.name} onChange={e=>setFacForm({...facForm, name: e.target.value})} className="border border-white/20 bg-white/10 p-3 rounded-xl outline-none" required />
                          <input type="text" placeholder="Designation" value={facForm.designation} onChange={e=>setFacForm({...facForm, designation: e.target.value})} className="border border-white/20 bg-white/10 p-3 rounded-xl outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <select value={facForm.department} onChange={e=>setFacForm({...facForm, department: e.target.value})} className="border border-white/20 bg-white/10 p-3 rounded-xl outline-none font-bold" required>
                            {['Oral Surgery', 'Orthodontics', 'Prosthodontics', 'Periodontics', 'Conservative Dentistry', 'Oral Pathology', 'Public Health Dentistry', 'Pedodontics', 'Oral Medicine'].map(d => <option key={d} value={d} className="text-gray-900">{d}</option>)}
                          </select>
                          <input type="text" placeholder="Experience" value={facForm.experience} onChange={e=>setFacForm({...facForm, experience: e.target.value})} className="border border-white/20 bg-white/10 p-3 rounded-xl outline-none" required />
                        </div>
                        <input type="text" placeholder="Specialization" value={facForm.specialization} onChange={e=>setFacForm({...facForm, specialization: e.target.value})} className="w-full border border-white/20 bg-white/10 p-3 rounded-xl outline-none" required />
                        <div className="relative">
                          <label className="block text-sm font-bold mb-2 opacity-90">Faculty Photo</label>
                          <input type="file" accept="image/*" onChange={handleFacultyPhotoUpload} className="w-full border border-white/20 bg-white/10 p-3 rounded-xl outline-none text-white file:bg-brand-teal file:text-white file:border-0 file:px-3 file:py-1 file:rounded-lg file:cursor-pointer file:font-bold" />
                          {facForm.image && (
                            <div className="mt-3 flex items-center gap-3">
                              <img src={facForm.image} alt="Faculty Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-white/30" />
                              <span className="text-xs opacity-90">Preview</span>
                            </div>
                          )}
                        </div>
                        <button type="submit" className="w-full bg-brand-teal text-white py-4 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all uppercase tracking-widest text-xs mt-2">Publish to College Site</button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* Syllabus & Curriculum Tracker (Migrated from Academic) */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 pt-6">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                   <h2 className="text-2xl font-bold text-brand-blue">Syllabus & Curriculum Tracker</h2>
                   <span className="bg-brand-blue text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest">Active Curriculum</span>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   <div className="space-y-4 max-h-100 overflow-y-auto pr-2">
                     {syllabus.map(item => (
                       <div key={item._id} className="bg-gray-50 p-6 rounded-2xl border-2 border-white shadow-sm flex justify-between items-start group hover:border-brand-blue transition-all">
                         <div>
                            <span className="text-xs font-bold text-brand-blue bg-white px-3 py-1 rounded-full border mb-2 inline-block uppercase">{item.year} Academic Year</span>
                            <h4 className="font-bold text-gray-800 mb-1">{item.description}</h4>
                            <div className="text-xs font-bold text-brand-teal opacity-90">RGUHS / DCI COMPLIANT</div>
                         </div>
                         <div className="flex gap-2">
                            {canModify('college') && (
                              <>
                                <button onClick={() => openEdit('academics/syllabus', item._id, item)} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-blue-50 text-brand-blue transition-all"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => confirmDelete('academics/syllabus', item._id)} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-red-50 text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="bg-brand-blue p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><BookOpen className="w-32 h-32" /></div>
                      <h3 className="text-xl font-bold mb-6 relative z-10">Upload New Curriculum</h3>
                      <form onSubmit={(e) => { e.preventDefault(); submitContent('academics/syllabus', sylForm, () => setSylForm({ year: '', description: '', fileLink: '' })); }} className="space-y-4 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold uppercase mb-1 opacity-90 tracking-widest">Target Year</label>
                              <input type="text" placeholder="e.g. 2026-27" value={sylForm.year} onChange={e=>setSylForm({...sylForm, year: e.target.value})} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white placeholder-white/50 outline-none focus:bg-white/20" required />
                           </div>
                           <div>
                              <label className="block text-xs font-bold uppercase mb-1 opacity-90 tracking-widest">Document Title</label>
                              <input type="text" placeholder="BDS Syllabus" value={sylForm.description} onChange={e=>setSylForm({...sylForm, description: e.target.value})} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white placeholder-white/50 outline-none focus:bg-white/20" required />
                           </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-1 opacity-90 tracking-widest">External URL / Storage Link</label>
                          <input type="text" placeholder="https://rguhs.ac.in/..." value={sylForm.fileLink} onChange={e=>setSylForm({...sylForm, fileLink: e.target.value})} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white placeholder-white/50 outline-none focus:bg-white/20" />
                        </div>
                        <button type="submit" className="w-full bg-brand-teal text-white py-4 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all uppercase tracking-widest text-xs mt-4">Sync Curriculum to Portal</button>
                      </form>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hostel' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Go back">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Hostel Portal Operations</h1>
                <p className="text-gray-800">Manage student residential complaints and maintenance records.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-full">
              <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold flex items-center">Active Complaints Ledger</h3>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-800">
                    <tr><th className="p-3">Student Name</th><th className="p-3">Room</th><th className="p-3">Category</th><th className="p-3">Description</th><th className="p-3">Status</th><th className="p-3">Operations</th></tr>
                  </thead>
                  <tbody>
                    {complaints.map(comp => (
                      <tr key={comp._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{comp.name}</td>
                        <td className="p-3">{comp.room}</td>
                        <td className="p-3 text-sm">{comp.category}</td>
                        <td className="p-3 text-sm max-w-xs truncate" title={comp.description}>{comp.description}</td>
                        <td className="p-3">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${comp.status === 'Solved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {comp.status}
                           </span>
                        </td>
                        <td className="p-3 flex space-x-2">
                           {comp.status !== 'Solved' ? (
                             <>
                               {canModify('hostel') && <button onClick={() => updateComplaintStatus(comp._id)} className="text-xs bg-brand-blue text-white px-2 py-1 rounded hover:opacity-90 font-medium tracking-wide">Mark as Solved</button>}
                               {canModify('hostel') && <button onClick={() => openEdit('admin/hostel/complaints', comp._id, { name: comp.name, room: comp.room, category: comp.category, description: comp.description })} className="p-1.5 text-brand-blue hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>}
                             </>
                           ) : (
                             canModify('hostel') && <button onClick={() => confirmDelete('admin/hostel/complaints', comp._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Permanently delete resolved complaint"><Trash2 className="w-4 h-4" /></button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;


