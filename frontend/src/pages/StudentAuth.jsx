import { useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, UserRound, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const StudentAuth = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const text = useMemo(() => {
    if (language === 'KN') {
      return {
        title: 'ವಿದ್ಯಾರ್ಥಿ ಲಾಗಿನ್',
        subtitle: 'ನಿಮ್ಮ ವಿದ್ಯಾರ್ಥಿ ಖಾತೆಗೆ ಲಾಗಿನ್ ಆಗಿ.',
        usn: 'USN',
        dateOfBirth: 'ಜನನ ದಿನಾಂಕ',
        login: 'ಲಾಗಿನ್',
        loginSuccess: 'ಯಶಸ್ವಿ ಲಾಗಿನ್',
        required: 'ದಯವಿಟ್ಟು ಅಗತ್ಯ ಮಾಹಿತಿ ಭರ್ತಿ ಮಾಡಿ.',
        invalidCredentials: 'ಅಮಾನ್ಯ USN ಅಥವಾ ಜನನ ದಿನಾಂಕ'
      };
    }

    return {
      title: 'Student Login',
      subtitle: 'Login to your student account.',
      usn: 'USN (University Serial Number)',
      dateOfBirth: 'Date of Birth (Password)',
      login: 'Login',
      loginSuccess: 'Login successful',
      required: 'Please fill in required fields.',
      invalidCredentials: 'Invalid USN or date of birth'
    };
  }, [language]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    usn: '',
    dateOfBirth: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginForm.usn || !loginForm.dateOfBirth) {
      setError(text.required);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/students/login', {
        usn: loginForm.usn.toUpperCase(),
        dateOfBirth: loginForm.dateOfBirth
      });

      sessionStorage.setItem('studentToken', res.data.token);
      sessionStorage.setItem('studentProfile', JSON.stringify(res.data.student));
      setSuccess(text.loginSuccess);
      
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || text.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-brand-teal/10 to-brand-blue/10">
      <div className="grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <BookOpen className="h-12 w-12 text-brand-teal" />
            <h1 className="text-3xl font-bold text-brand-teal text-center">{text.title}</h1>
            <p className="text-gray-800 text-center text-sm">{text.subtitle}</p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserRound className="inline h-4 w-4 mr-2" />
                {text.usn}
              </label>
              <input
                type="text"
                placeholder="e.g., 1RV22XX001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                value={loginForm.usn}
                onChange={(e) => setLoginForm({ ...loginForm, usn: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                {text.dateOfBirth}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                value={loginForm.dateOfBirth}
                onChange={(e) => setLoginForm({ ...loginForm, dateOfBirth: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-teal text-white py-2 rounded-lg font-medium hover:bg-brand-teal/90 transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : text.login}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentAuth;
