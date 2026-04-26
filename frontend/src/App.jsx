import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import CollegeHome from './pages/CollegeHome';
import Admissions from './pages/Admissions';
import About from './pages/About';
import CollegeAbout from './pages/CollegeAbout';
import Research from './pages/Research';
import Departments from './pages/Departments';
import Contact from './pages/Contact';
import { HostelComplaint } from './pages/HostelComplaint';
import PatientPortal from './pages/PatientPortal';
import PatientDashboard from './pages/PatientDashboard';
import HospitalAuth from './pages/HospitalAuth';
import StudentAuth from './pages/StudentAuth';
import StudentDashboard from './pages/StudentDashboard';
import Student from './pages/Student';
import Feedback from './pages/Feedback';
import PortalSelection from './pages/PortalSelection';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import LiveQueueView from './pages/LiveQueueView';
import ProtectedRoute from './components/ProtectedRoute';
import PatientProtectedRoute from './components/PatientProtectedRoute';
import StudentProtectedRoute from './components/StudentProtectedRoute';
import WebsiteWelcomePopup from './components/WebsiteWelcomePopup';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';

// Set up Axios inteceptor for bearer tokens
import axios from 'axios';
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const hasStudentSession = Boolean(sessionStorage.getItem('studentToken'));

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {!isAdminPage && <Navbar />}
      <WebsiteWelcomePopup />
      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/college-home" element={hasStudentSession ? <Navigate to="/student-dashboard" replace /> : <CollegeHome />} />
          <Route path="/about" element={<About />} />
          <Route path="/college-about" element={hasStudentSession ? <Navigate to="/student-dashboard" replace /> : <CollegeAbout />} />
          <Route path="/admissions" element={hasStudentSession ? <Navigate to="/student-dashboard" replace /> : <Admissions />} />
          <Route path="/departments" element={hasStudentSession ? <Navigate to="/student-dashboard" replace /> : <Departments />} />
          <Route path="/research" element={hasStudentSession ? <Navigate to="/student-dashboard" replace /> : <Research />} />
          <Route path="/hospital-auth" element={<HospitalAuth />} />
          <Route path="/student-auth" element={hasStudentSession ? <Navigate to="/student-dashboard" replace /> : <StudentAuth />} />
          <Route path="/student-dashboard" element={<StudentProtectedRoute><StudentDashboard /></StudentProtectedRoute>} />
          <Route path="/patient-dashboard" element={<PatientProtectedRoute><PatientDashboard /></PatientProtectedRoute>} />
          <Route path="/patient-portal" element={<PatientProtectedRoute><PatientPortal /></PatientProtectedRoute>} />
          <Route path="/student" element={<StudentProtectedRoute><Student /></StudentProtectedRoute>} />
          <Route path="/portal-selection" element={<PortalSelection />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hostel" element={<StudentProtectedRoute><HostelComplaint /></StudentProtectedRoute>} />
          <Route path="/live-queue" element={<PatientProtectedRoute><LiveQueueView /></PatientProtectedRoute>} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;
