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
        accountExistsUseLogin: 'ಈ ಫೋನ್/ಇಮೇಲ್‌ಗೆ ಖಾತೆ ಈಗಾಗಲೇ ಇದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.',
        forgotPassword: 'ಪಾಸ್ವರ್ಡ್ ಮರೆತಿದ್ದೀರಾ?',
        forgotPasswordTitle: 'ಪಾಸ್ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ',
        forgotPasswordSubtitle: 'ನಿಮ್ಮ ಖಾತೆ ಮರುಪ್ರಾಪ್ತಿ ಮಾಡಲು ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ರೋಗಿ ಐಡಿ ನಮೂದಿಸಿ',
        verifyIdentity: 'ನಿಮ್ಮ ಪರಿಚಯ ದೃಢೀಕರಿಸಿ',
        newPassword: 'ಹೊಸ ಪಾಸ್ವರ್ಡ್',
        resetPassword: 'ಪಾಸ್ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ',
        backToLogin: 'ಲಾಗಿನ್‌ಗೆ ಹಿಂದಿರುಗಿ',
        contactSupport: 'ಸಹಾಯತೆಗಾಗಿ ಸಂಪರ್ಕಿಸಿ: 080-XXXX-XXXX',
        passwordResetSuccess: 'ಪಾಸ್ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೊಸ ಪಾಸ್ವರ್ಡ್‌ನೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಿ.',
        patientNotFound: 'ರೋಗಿ ಖಾತೆ ಕಂಡುಬರಲಿಲ್ಲ.'
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
      accountExistsUseLogin: 'An account already exists for this phone/email. Please login.',
      forgotPassword: 'Forgot Password?',
      forgotPasswordTitle: 'Reset Password',
      forgotPasswordSubtitle: 'Enter your phone number or patient ID to recover your account',
      verifyIdentity: 'Verify Your Identity',
      newPassword: 'New Password',
      resetPassword: 'Reset Password',
      backToLogin: 'Back to Login',
      contactSupport: 'Need help? Contact support: 080-XXXX-XXXX',
      passwordResetSuccess: 'Password reset successfully. Please login with your new password.',
      patientNotFound: 'Patient account not found.'
    };
  }, [language]);

  const [activeTab, setActiveTab] = useState('register');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: verify identity, 2: reset password
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    patientIdOrPhone: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [verifiedPatientId, setVerifiedPatientId] = useState('');

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

      if (!res.data?.success) {
        setError(res.data?.message || 'Login failed.');
        return;
      }

      storeSessionAndNavigate(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!forgotPasswordForm.patientIdOrPhone) {
      setError(text.required);
      return;
    }

    try {
      setLoading(true);
      const value = forgotPasswordForm.patientIdOrPhone.trim();
      const payload = value.toUpperCase().startsWith('RRDCHP') 
        ? { patientId: value.toUpperCase() } 
        : { phone: value };

      // In a real app, this would verify and send OTP via SMS/email
      // For now, we'll simulate verification
      const res = await axios.post('http://localhost:5000/api/patients/verify-identity', payload);
      
      if (res.data.success) {
        setVerifiedPatientId(res.data.patientId);
        setForgotPasswordStep(2);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || text.patientNotFound);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!forgotPasswordForm.newPassword || !forgotPasswordForm.confirmNewPassword) {
      setError(text.required);
      return;
    }

    if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmNewPassword) {
      setError(text.passwordMismatch);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/patients/reset-password', {
        patientId: verifiedPatientId,
        newPassword: forgotPasswordForm.newPassword
      });

      if (res.data.success) {
        setError('');
        alert(text.passwordResetSuccess);
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setForgotPasswordForm({ patientIdOrPhone: '', newPassword: '', confirmNewPassword: '' });
        setVerifiedPatientId('');
        setActiveTab('login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotPasswordForm({ patientIdOrPhone: '', newPassword: '', confirmNewPassword: '' });
    setVerifiedPatientId('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="bg-brand-blue text-white p-7">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7 text-brand-teal" />
            <h1 className="text-2xl font-bold">{text.title}</h1>
          </div>
          <p className="text-brand-light text-sm">{text.subtitle}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              className={`py-2 rounded-md font-semibold text-sm ${activeTab === 'register' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-800'}`}
              onClick={() => setActiveTab('register')}
            >
              {text.registerTab}
            </button>
            <button
              type="button"
              className={`py-2 rounded-md font-semibold text-sm ${activeTab === 'login' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-800'}`}
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
                className="w-full bg-brand-teal text-white py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:opacity-90"
              >
                {loading ? '...' : text.createAccount}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{text.patientIdOrPhone}</label>
                <div className="relative">
                  <UserRound className="w-4 h-4 text-gray-800 absolute left-3 top-1/2 -translate-y-1/2" />
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
                  <KeyRound className="w-4 h-4 text-gray-800 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-brand-teal hover:text-brand-teal/80 mt-2 font-semibold"
                >
                  {text.forgotPassword}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue text-white py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:opacity-90"
              >
                {loading ? '...' : text.login}
              </button>
            </form>
          )}

          {createdPatientId && (
            <div className="mt-5 p-4 rounded-md border border-green-200 bg-green-50 text-green-800 text-sm">
              <p className="font-semibold">{text.accountCreated}</p>
              <p>{text.yourPatientId}: <span className="font-bold">{createdPatientId}</span></p>
              <p className="mt-2 text-xs opacity-80">{text.openPortal}</p>
            </div>
          )}

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-brand-teal text-white p-6">
                  <h2 className="text-xl font-bold">{text.forgotPasswordTitle}</h2>
                  <p className="text-brand-light text-sm mt-1">{text.forgotPasswordSubtitle}</p>
                </div>

                <div className="p-6">
                  {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

                  {forgotPasswordStep === 1 ? (
                    <form className="space-y-4" onSubmit={handleForgotPasswordVerify}>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">{text.verifyIdentity}</label>
                        <input
                          type="text"
                          placeholder="Patient ID (RRDCHP...) or Phone"
                          value={forgotPasswordForm.patientIdOrPhone}
                          onChange={(e) => setForgotPasswordForm((p) => ({ ...p, patientIdOrPhone: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                          required
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700">
                        📱 {text.contactSupport}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={closeForgotPassword}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50"
                        >
                          {text.backToLogin}
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-md font-medium hover:bg-opacity-90 disabled:opacity-90"
                        >
                          {loading ? '...' : 'Verify'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form className="space-y-4" onSubmit={handleForgotPasswordReset}>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">{text.newPassword}</label>
                        <input
                          type="password"
                          value={forgotPasswordForm.newPassword}
                          onChange={(e) => setForgotPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">{text.confirmPassword}</label>
                        <input
                          type="password"
                          value={forgotPasswordForm.confirmNewPassword}
                          onChange={(e) => setForgotPasswordForm((p) => ({ ...p, confirmNewPassword: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                          required
                        />
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-md p-3 text-xs text-green-700">
                        ✓ {language === 'KN' ? 'ಹೊಸ ಪಾಸ್ವರ್ಡ್ ಅನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ' : 'Your new password will be securely saved'}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setForgotPasswordStep(1)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50"
                        >
                          {language === 'KN' ? 'ಹಿಂದಿರುಗಿ' : 'Back'}
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-90"
                        >
                          {loading ? '...' : text.resetPassword}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalAuth;
