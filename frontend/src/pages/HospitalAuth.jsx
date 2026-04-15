import { useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserRound, KeyRound } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const HospitalAuth = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const text = useMemo(() => {
    if (language === 'KN') {
      return {
        title: 'ಆಸ್ಪತ್ರೆ ರೋಗಿ ದೃಢೀಕರಣ',
        subtitle: 'ಹೊಸ ಖಾತೆ ತೆರೆಯಿರಿ ಅಥವಾ ನಿಮ್ಮ ರೋಗಿ ಖಾತೆಗೆ ಲಾಗಿನ್ ಆಗಿ.',
        registerTab: 'ಹೊಸ ಖಾತೆ',
        loginTab: 'ಲಾಗಿನ್',
        fullName: 'ಪೂರ್ಣ ಹೆಸರು',
        phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
        email: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)',
        patientIdOrPhone: 'ರೋಗಿ ಐಡಿ ಅಥವಾ ಫೋನ್',
        password: 'ಪಾಸ್ವರ್ಡ್',
        confirmPassword: 'ಪಾಸ್ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
        createAccount: 'ಖಾತೆ ರಚಿಸಿ',
        login: 'ಲಾಗಿನ್',
        accountCreated: 'ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ಸೃಷ್ಟಿಸಲಾಗಿದೆ.',
        yourPatientId: 'ನಿಮ್ಮ ರೋಗಿ ಐಡಿ',
        openPortal: 'ರೋಗಿ ಸೇವೆ ತೆರೆಸಿ',
        passwordMismatch: 'ಪಾಸ್ವರ್ಡ್ ಮತ್ತು ದೃಢೀಕರಣ ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ.',
        required: 'ದಯವಿಟ್ಟು ಅಗತ್ಯ ಮಾಹಿತಿಯನ್ನು ಭರ್ತಿ ಮಾಡಿ.',
        accountExistsUseLogin: 'ಈ ಫೋನ್/ಇಮೇಲ್‌ಗೆ ಖಾತೆ ಈಗಾಗಲೇ ಇದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.'
      };
    }

    return {
      title: 'Hospital Patient Authentication',
      subtitle: 'Create a new patient account or login to your hospital account.',
      registerTab: 'Create Account',
      loginTab: 'Login',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email (optional)',
      patientIdOrPhone: 'Patient ID or Phone',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      login: 'Login',
      accountCreated: 'Account created successfully.',
      yourPatientId: 'Your Patient ID',
      openPortal: 'Open Patient Services',
      passwordMismatch: 'Password and confirmation do not match.',
      required: 'Please fill required fields.',
      accountExistsUseLogin: 'An account already exists for this phone/email. Please login.'
    };
  }, [language]);

  const [activeTab, setActiveTab] = useState('register');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState('');

  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loginForm, setLoginForm] = useState({
    patientIdOrPhone: '',
    password: ''
  });

  const storeSessionAndNavigate = (data) => {
    sessionStorage.setItem('patientToken', data.token);
    sessionStorage.setItem('patientProfile', JSON.stringify(data.patient));
    navigate('/patient-portal');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!registerForm.name || !registerForm.phone || !registerForm.password) {
      setError(text.required);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError(text.passwordMismatch);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/patients/register', {
        name: registerForm.name,
        phone: registerForm.phone,
        email: registerForm.email,
        password: registerForm.password
      });

      setCreatedPatientId(res.data.patient.patientId);
      storeSessionAndNavigate(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setActiveTab('login');
        setLoginForm((p) => ({ ...p, patientIdOrPhone: registerForm.phone }));
        setError(text.accountExistsUseLogin);
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginForm.patientIdOrPhone || !loginForm.password) {
      setError(text.required);
      return;
    }

    const value = loginForm.patientIdOrPhone.trim();
    const payload = {
      password: loginForm.password,
      ...(value.toUpperCase().startsWith('RRDCHP') ? { patientId: value.toUpperCase() } : { phone: value })
    };

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/patients/login', payload);
      storeSessionAndNavigate(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="bg-brand-blue text-white p-7">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7 text-brand-teal" />
            <h1 className="text-2xl font-black">{text.title}</h1>
          </div>
          <p className="text-brand-light text-sm">{text.subtitle}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              className={`py-2 rounded-md font-semibold text-sm ${activeTab === 'register' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-600'}`}
              onClick={() => setActiveTab('register')}
            >
              {text.registerTab}
            </button>
            <button
              type="button"
              className={`py-2 rounded-md font-semibold text-sm ${activeTab === 'login' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-600'}`}
              onClick={() => setActiveTab('login')}
            >
              {text.loginTab}
            </button>
          </div>

          {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

          {activeTab === 'register' ? (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{text.fullName}</label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{text.phone}</label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{text.email}</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{text.password}</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{text.confirmPassword}</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-teal text-white py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:opacity-70"
              >
                {loading ? '...' : text.createAccount}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{text.patientIdOrPhone}</label>
                <div className="relative">
                  <UserRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginForm.patientIdOrPhone}
                    onChange={(e) => setLoginForm((p) => ({ ...p, patientIdOrPhone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{text.password}</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue text-white py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:opacity-70"
              >
                {loading ? '...' : text.login}
              </button>
            </form>
          )}

          {createdPatientId && (
            <div className="mt-5 p-4 rounded-md border border-green-200 bg-green-50 text-green-800 text-sm">
              <p className="font-semibold">{text.accountCreated}</p>
              <p>{text.yourPatientId}: <span className="font-black">{createdPatientId}</span></p>
              <p className="mt-2 text-xs opacity-80">{text.openPortal}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalAuth;
