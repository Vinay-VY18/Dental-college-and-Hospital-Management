import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 1. Initial Authentication Check
  useEffect(() => {
    if (sessionStorage.getItem('adminToken')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password, selectedRole });
      
      // Use sessionStorage for single-tab strictness
      sessionStorage.setItem('adminToken', res.data.token);
      sessionStorage.setItem('adminRole', res.data.role);
      
      // Notify other tabs via auth_channel to invalidate old sessions
      const authChannel = new BroadcastChannel('auth_channel');
      const tabId = Math.random().toString(36).substring(7);
      sessionStorage.setItem('tabId', tabId);
      authChannel.postMessage({ type: 'LOGIN', source: tabId, time: Date.now() });
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center -mt-20 relative">
      {/* Navigation Options */}
      <div className="absolute top-4 left-4 right-4 flex gap-4 justify-center">
        <button 
          onClick={() => navigate('/college-home')}
          className="px-6 py-2 bg-brand-blue text-white border-2 border-brand-blue rounded-lg transition-all font-semibold hover:bg-opacity-90 shadow-md"
        >
          College
        </button>
        <button 
          onClick={() => navigate('/portal-selection')}
          className="px-6 py-2 bg-green-600 text-white border-2 border-green-600 rounded-lg transition-all font-semibold hover:bg-opacity-90 shadow-md"
        >
          Hospital
        </button>
      </div>
      <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-xl border-t-8 border-brand-blue">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-brand-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Control Center</h2>
          <p className="text-gray-500 text-sm mt-2">Authorized Personnel Only</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center border border-red-200">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Administrative Portal</label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-blue outline-none bg-gray-50">
              <option value="SUPER_ADMIN">Global / Super Admin</option>
              <option value="ADMIN_CLINIC">Clinic Management (Appointments/Doctors)</option>
              <option value="ADMIN_ACADEMIC">Academic Management (Syllabus)</option>
              <option value="ADMIN_COLLEGE">College Sections (Admissions/Research/Tutors)</option>
              <option value="ADMIN_HOSTEL">Hostel Portal (Student Support)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-blue outline-none focus:border-brand-blue" 
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secure Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-blue outline-none focus:border-brand-blue" 
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-brand-blue text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-all shadow-md mt-4">
            Authenticate Access
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
