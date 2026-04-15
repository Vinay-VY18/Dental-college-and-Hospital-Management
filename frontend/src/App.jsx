import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import Student from './pages/Student';
import Feedback from './pages/Feedback';
import PortalSelection from './pages/PortalSelection';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import LiveQueueView from './pages/LiveQueueView';
import ProtectedRoute from './components/ProtectedRoute';
import PatientProtectedRoute from './components/PatientProtectedRoute';
import WebsiteWelcomePopup from './components/WebsiteWelcomePopup';
import { LanguageProvider } from './context/LanguageContext';

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

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {!isAdminPage && <Navbar />}
      <WebsiteWelcomePopup />
      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/college-home" element={<CollegeHome />} />
          <Route path="/about" element={<About />} />
          <Route path="/college-about" element={<CollegeAbout />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/research" element={<Research />} />
          <Route path="/hospital-auth" element={<HospitalAuth />} />
          <Route path="/patient-dashboard" element={<PatientProtectedRoute><PatientDashboard /></PatientProtectedRoute>} />
          <Route path="/patient-portal" element={<PatientProtectedRoute><PatientPortal /></PatientProtectedRoute>} />
          <Route path="/student" element={<Student />} />
          <Route path="/portal-selection" element={<PortalSelection />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hostel" element={<HostelComplaint />} />
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
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;
