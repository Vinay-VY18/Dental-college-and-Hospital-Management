import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, User, GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { translations } from '../../utils/translations';

const Navbar = () => {
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = translations[language];

  const collegeRoutes = ['/college-home', '/college-about', '/admissions', '/departments', '/research', '/student', '/hostel'];
  const isCollegeSection = collegeRoutes.some((route) => location.pathname === route || location.pathname.startsWith(`${route}/`));
  const hasPatientSession = Boolean(sessionStorage.getItem('patientToken'));

  const navLinks = isCollegeSection
    ? [
        { label: t.HOME, to: '/college-home' },
        { label: t.ABOUT, to: '/college-about' },
        { label: t.ADMISSIONS, to: '/admissions' },
        { label: t.DEPARTMENTS, to: '/departments' },
        { label: t.RESEARCH, to: '/research' },
        { label: t.STUDENT_SERVICES, to: '/student' },
        { label: t.HOSTEL_PORTAL, to: '/hostel' },
        { label: t.FEEDBACK, to: '/feedback' }
      ]
    : [
        { label: t.HOME, to: '/' },
        { label: t.ABOUT, to: '/about' },
        { label: t.PATIENT_SERVICES, to: '/patient-portal' },
        ...(hasPatientSession ? [{ label: t.PATIENT_DASHBOARD, to: '/patient-dashboard' }] : []),
        { label: t.LIVE_QUEUE, to: '/live-queue' },
        { label: t.FEEDBACK, to: '/feedback' },
        { label: t.CONTACT, to: '/contact' }
      ];

  const topBarClass = isCollegeSection ? 'bg-brand-teal' : 'bg-brand-blue';
  const logoClass = isCollegeSection ? 'bg-brand-teal' : 'bg-brand-blue';
  const switchPath = isCollegeSection ? '/' : '/college-home';
  const homePath = isCollegeSection ? '/college-home' : '/';
  const switchLabel = isCollegeSection ? t.OPEN_HOSPITAL : t.OPEN_COLLEGE;
  const subTitle = isCollegeSection ? t.DENTAL_COLLEGE : t.DENTAL_HOSPITAL;

  const handlePatientLogout = () => {
    sessionStorage.removeItem('patientToken');
    sessionStorage.removeItem('patientProfile');
    navigate('/hospital-auth');
  };

  const isActive = (to) => location.pathname === to;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Top utility bar */}
      <div className={`${topBarClass} text-white text-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 justify-between items-center hidden sm:flex">
          <div className="flex space-x-6 items-center">
            <span>📞 080-28437150</span>
            <span>✉️ info@rrdch.org</span>
            <Link
              to={switchPath}
              className="bg-white/15 px-3 py-1 rounded text-[10px] font-black uppercase hover:bg-white hover:text-brand-blue transition-all"
            >
              {switchLabel}
            </Link>
            <Link 
              to={sessionStorage.getItem('adminToken') ? "/admin/dashboard" : "/admin"} 
              className="bg-brand-teal px-3 py-0.5 rounded text-[10px] font-black uppercase hover:bg-white hover:text-brand-blue transition-all"
            >
              {t.STAFF_LOGIN}
            </Link>
            {!isCollegeSection && (
              hasPatientSession ? (
                <button
                  type="button"
                  onClick={handlePatientLogout}
                  className="bg-white/15 px-3 py-1 rounded text-[10px] font-black uppercase hover:bg-white hover:text-brand-blue transition-all"
                >
                  {t.PATIENT_LOGOUT}
                </button>
              ) : (
                <Link
                  to="/hospital-auth"
                  className="bg-white/15 px-3 py-1 rounded text-[10px] font-black uppercase hover:bg-white hover:text-brand-blue transition-all"
                >
                  {t.PATIENT_LOGIN}
                </Link>
              )
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLanguage} 
              className="flex items-center hover:text-brand-teal transition-colors bg-white/10 px-3 py-1 rounded-full text-xs font-semibold"
              aria-label="Toggle Language"
            >
              <Globe className="h-3 w-3 mr-1" />
              {language === 'EN' ? 'ಕನ್ನಡ' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center gap-4">
            <Link to={homePath} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-20 w-20 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-white border-3 border-brand-teal flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Rajarajeshwari Dental College Logo" 
                  className="h-18 w-18 object-contain"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1609207825181-52d3214556f1?auto=format&fit=crop&q=80&w=200&h=200';
                    e.target.style.padding = '8px';
                  }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-2xl text-brand-blue leading-tight tracking-tight">Rajarajeshwari</span>
                <span className="text-sm font-semibold text-brand-teal leading-tight tracking-wide uppercase">{subTitle}</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-3">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-2 py-2 font-medium transition-colors text-sm rounded ${
                  isActive(item.to)
                    ? 'text-brand-blue bg-brand-light'
                    : 'text-gray-700 hover:text-brand-blue'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Section CTA */}
          <div className="hidden lg:flex items-center space-x-3 ml-4">
            <Link
              to={switchPath}
              className="flex items-center px-4 py-2 border-2 border-brand-blue text-brand-blue bg-white rounded-md hover:bg-brand-blue hover:text-white transition-all font-semibold text-sm shadow-sm hover:shadow-md"
            >
              {isCollegeSection ? <User className="w-4 h-4 mr-2" /> : <GraduationCap className="w-4 h-4 mr-2" />}
              {switchLabel}
            </Link>
          </div>

          <div className="lg:hidden flex items-center mb-2">
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-brand-blue hover:text-brand-teal p-2">
               {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="bg-white border-t border-gray-100 shadow-inner px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((item) => (
            <Link
              key={`mobile-${item.to}`}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 font-medium rounded-md ${
                isActive(item.to)
                  ? 'bg-brand-light text-brand-blue'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="pt-4 mt-2 border-t border-gray-100">
            <Link
              to={switchPath}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-3 py-3 bg-brand-teal text-white rounded-md font-medium justify-center shadow-sm"
            >
              {isCollegeSection ? <User className="w-5 h-5 mr-2" /> : <GraduationCap className="w-5 h-5 mr-2" />}
              {switchLabel}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
