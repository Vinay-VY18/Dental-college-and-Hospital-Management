import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Building2, Hospital, Stethoscope, GraduationCap, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const WebsiteWelcomePopup = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hidePopup = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

  // Dental related images that change every 2.5 seconds
  const dentalImages = [
    'https://admissionkaro.com/wp-content/uploads/2023/02/Management-quota-admission-in-Rajarajeswari-Dental-College-and-Hospital-Bangalore.jpg',
    'https://www.rrdch.org/rrdch/wp-content/uploads/2024/04/Rank-holders-768x363.jpg',
    'https://www.rrdch.org/rrdch/wp-content/uploads/2015/06/VEN_0090.jpg',
    'https://admissionkaro.com/wp-content/uploads/2023/02/Management-quota-admission-in-Rajarajeswari-Dental-College-and-Hospital-Bangalore.jpg',
    'https://www.rrdch.org/rrdch/wp-content/uploads/2024/04/Rank-holders-768x363.jpg',
    'https://www.rrdch.org/rrdch/wp-content/uploads/2015/06/VEN_0090.jpg',
  ];

  useEffect(() => {
    if (!hidePopup) {
      const seen = sessionStorage.getItem('rrdch_welcome_popup_seen');
      if (!seen) {
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
    }
  }, [hidePopup]);

  // Image carousel effect
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % dentalImages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, dentalImages.length]);

  const closePopup = () => {
    sessionStorage.setItem('rrdch_welcome_popup_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen || hidePopup) {
    return null;
  }

  const content = language === 'KN'
    ? {
        title: 'ರಾಜರಾಜೇಶ್ವರಿ ದಂತ ಕಾಲೇಜು ಮತ್ತು ಆಸ್ಪತ್ರೆಗೆ ಸ್ವಾಗತ',
        subtitle: 'ಈ ಪಾಪ್‌ಅಪ್ ವೆಬ್‌ಸೈಟ್‌ನ ಎಲ್ಲಾ ಪ್ರಮುಖ ವಿಭಾಗಗಳ ಸಂಪೂರ್ಣ ವಿವರ ನೀಡುತ್ತದೆ.',
        closeAria: 'ಸ್ವಾಗತ ಪಾಪ್‌ಅಪ್ ಮುಚ್ಚಿ',
        hospitalSection: 'ಆಸ್ಪತ್ರೆ ವೆಬ್‌ಸೈಟ್ ವಿಭಾಗ',
        collegeSection: 'ಕಾಲೇಜು ವೆಬ್‌ಸೈಟ್ ವಿಭಾಗ',
        hospitalItems: [
          { label: 'ಆಸ್ಪತ್ರೆ ಮುಖಪುಟ', desc: 'ಕ್ಲಿನಿಕಲ್ ಸೇವೆಗಳು ಮತ್ತು ರೋಗಿ ಆರೈಕೆಯ ಮುಖ್ಯಾಂಶಗಳು.' },
          { label: 'ಆಸ್ಪತ್ರೆ ಬಗ್ಗೆ', desc: 'ಆಸ್ಪತ್ರೆಯ ಧ್ಯೇಯ, ಆರೈಕೆ ಗುಣಮಟ್ಟ ಮತ್ತು ಸೇವಾ ಸ್ತಂಭಗಳು.' },
          { label: 'ರೋಗಿ ಸೇವೆಗಳು', desc: 'ಆನ್‌ಲೈನ್ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ಕಿಂಗ್ ಮತ್ತು ಟ್ರ್ಯಾಕಿಂಗ್.' },
          { label: 'PG ವೈದ್ಯರ ವೇಳಾಪಟ್ಟಿ', desc: 'ವಿಭಾಗವಾರು ವೈದ್ಯರ ಲಭ್ಯತೆ/ಸ್ಥಿತಿ.' },
          { label: 'ಸಂಪರ್ಕ', desc: 'ಕ್ಯಾಂಪಸ್ ವಿಳಾಸ ಮತ್ತು ಆಸ್ಪತ್ರೆಗೆ ಬರುವ ದಿಕ್ಕಿನ ನಕ್ಷೆ.' },
          { label: 'ಪ್ರತಿಕ್ರಿಯೆ', desc: 'ಸಾರ್ವಜನಿಕ ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ಸೇವಾ ಗುಣಮಟ್ಟದ ಸೂಚನೆಗಳು.' }
        ],
        collegeItems: [
          { label: 'ಕಾಲೇಜು ಮುಖಪುಟ', desc: 'ಅಕಾಡೆಮಿಕ್ ಅವಲೋಕನ, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಹೈಲೈಟ್ಸ್.' },
          { label: 'ಕಾಲೇಜು ಬಗ್ಗೆ', desc: 'ಅಕಾಡೆಮಿಕ್ ದೃಷ್ಟಿ, ಪಠ್ಯಕ್ರಮ, ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಫಲಿತಾಂಶಗಳು.' },
          { label: 'ಪ್ರವೇಶಗಳು', desc: 'ವಿಭಾಗವಾರು ಸೀಟು, ಶುಲ್ಕ ಮತ್ತು ಅರ್ಹತೆ ವಿವರಗಳು.' },
          { label: 'ವಿಭಾಗಗಳು', desc: 'ಶೈಕ್ಷಣಿಕ ವಿಭಾಗಗಳು ಮತ್ತು ವಿಶೇಷತೆ ಕ್ಷೇತ್ರಗಳು.' },
          { label: 'ಸಂಶೋಧನೆ', desc: 'ಪ್ರಕಟಣೆಗಳು, ಯೋಜನೆಗಳು ಮತ್ತು ಸಂಶೋಧನಾ ಚಟುವಟಿಕೆಗಳು.' },
          { label: 'ವಿದ್ಯಾರ್ಥಿ ಸೇವೆಗಳು', desc: 'ಸಿಲೆಬಸ್, ಕಾರ್ಯಕ್ರಮಗಳು, ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು.' },
          { label: 'ವಸತಿ ನಿಲಯ ಪೋರ್ಟಲ್', desc: 'ವಸತಿ ಮತ್ತು ದೂರು ಸಹಾಯ ಪೋರ್ಟಲ್.' }
        ],
        patientFeatures: 'ರೋಗಿ ವೈಶಿಷ್ಟ್ಯಗಳು',
        patientFeaturesDesc: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ, ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿಯಿಂದ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ, ಮತ್ತು ವೈದ್ಯರ ವೇಳಾಪಟ್ಟಿ ನೋಡಿ.',
        academicFeatures: 'ಶೈಕ್ಷಣಿಕ ವೈಶಿಷ್ಟ್ಯಗಳು',
        academicFeaturesDesc: 'ಪ್ರವೇಶ ಪ್ರಕ್ರಿಯೆ, ವಿಭಾಗ ಮಾಹಿತಿ, ಸಂಶೋಧನೆ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಪ್ರವೇಶಿಸಿ.',
        adminFeatures: 'ನಿರ್ವಹಣಾ ವೈಶಿಷ್ಟ್ಯಗಳು',
        adminFeaturesDesc: 'ಸುರಕ್ಷಿತ ಆಡ್ಮಿನ್ ಲಾಗಿನ್ ಮೂಲಕ ಕ್ಲಿನಿಕಲ್, ಅಕಾಡೆಮಿಕ್ ಮತ್ತು ಕಾಲೇಜು ವಿಷಯ ನಿರ್ವಹಣೆ.',
        highlights: 'ಜಾಗತಿಕ ವೆಬ್‌ಸೈಟ್ ಮುಖ್ಯಾಂಶಗಳು',
        highlightItems: [
          'ಆಸ್ಪತ್ರೆ ಮತ್ತು ಕಾಲೇಜಿಗೆ ಪ್ರತ್ಯೇಕ ಹೆಡರ್‌ಗಳೊಂದಿಗೆ ಡ್ಯುಯಲ್-ಮೋಡ್ ನಾವಿಗೇಶನ್.',
          'ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡ ಭಾಷಾ ಟಾಗಲ್ ಬೆಂಬಲ.',
          'ಡೆಸ್ಕ್‌ಟಾಪ್ ಮತ್ತು ಮೊಬೈಲ್‌ಗೆ ಸೂಕ್ತ ಪ್ರತಿಕ್ರಿಯಾಶೀಲ ವಿನ್ಯಾಸ.',
          'ಪ್ರವೇಶ, ವೈದ್ಯರು, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ರೋಗಿ ಸೇವೆಗೆ ಸಮಗ್ರ ಬ್ಯಾಕ್‌ಎಂಡ್ API ಸಂಪರ್ಕ.'
        ],
        openHospital: 'ಆಸ್ಪತ್ರೆ ಮುಖಪುಟ ತೆರೆಯಿರಿ',
        openCollege: 'ಕಾಲೇಜು ಮುಖಪುಟ ತೆರೆಯಿರಿ',
        continue: 'ವೆಬ್‌ಸೈಟ್ ಮುಂದುವರಿಸಿ'
      }
    : {
        title: 'Welcome to Rajarajeshwari Dental College and Hospital',
        subtitle: 'This popup gives a complete overview of the website and all major sections.',
        closeAria: 'Close welcome popup',
        hospitalSection: 'Hospital Website Section',
        collegeSection: 'College Website Section',
        hospitalItems: [
          { label: 'Hospital Home', desc: 'Clinical services highlights and patient care focus.' },
          { label: 'Hospital About', desc: 'Hospital mission, care quality, and service pillars.' },
          { label: 'Patient Services', desc: 'Online appointment booking and appointment tracking.' },
          { label: 'PG Doctor Schedule', desc: 'Live availability/status of doctors by department.' },
          { label: 'Contact', desc: 'Campus address and directions map for hospital visits.' },
          { label: 'Feedback', desc: 'Public feedback and service quality responses.' }
        ],
        collegeItems: [
          { label: 'College Home', desc: 'Academic overview, programs, and college highlights.' },
          { label: 'College About', desc: 'Academic vision, curriculum, mentorship, and outcomes.' },
          { label: 'Admissions', desc: 'Department-wise admission details, seats, fees, and eligibility.' },
          { label: 'Departments', desc: 'Academic departments and specialization areas.' },
          { label: 'Research', desc: 'Publications, projects, and research-oriented activity.' },
          { label: 'Student Services', desc: 'Syllabus, events, schedules, and academic resources.' },
          { label: 'Hostel Portal', desc: 'Hostel and complaint support portal.' }
        ],
        patientFeatures: 'Patient Features',
        patientFeaturesDesc: 'Book appointments, track status using a tracking ID, and view operational doctor schedules.',
        academicFeatures: 'Academic Features',
        academicFeaturesDesc: 'Access admissions workflow, department data, research feed, and student-focused resources.',
        adminFeatures: 'Admin Features',
        adminFeaturesDesc: 'Secure admin login supports content management for clinical, academic, and college modules.',
        highlights: 'Global Website Highlights',
        highlightItems: [
          'Dual-mode navigation with separate Hospital and College headers.',
          'Language toggle support for English and Kannada navigation text.',
          'Responsive layout optimized for desktop and mobile screens.',
          'Integrated backend APIs for admissions, doctors, events, and patient workflows.'
        ],
        openHospital: 'Open Hospital Home',
        openCollege: 'Open College Home',
        continue: 'Continue to Website'
      };

  return (
    <div className="fixed inset-0 z-100 bg-black/55 backdrop-blur-xs flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-brand-blue text-white px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0 border-3 border-brand-teal">
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
            <div>
              <h2 className="text-2xl md:text-3xl font-black">{content.title}</h2>
              <p className="text-brand-light mt-2 text-sm md:text-base">
                {content.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePopup}
            className="shrink-0 p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            aria-label={content.closeAria}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Dynamic Dental Images Carousel */}
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg border-4 border-brand-teal bg-gradient-to-br from-brand-blue to-brand-teal">
            <img
              src={dentalImages[currentImageIndex]}
              alt="Dental services"
              className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Image indicators at bottom */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {dentalImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50 w-2 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            {/* Top label */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-sm font-bold text-brand-blue">Dental Excellence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="text-lg font-black text-brand-blue flex items-center gap-2">
                <Hospital className="h-5 w-5 text-brand-teal" /> {content.hospitalSection}
              </h3>
              <ul className="mt-3 text-sm text-gray-700 space-y-2">
                {content.hospitalItems.map((item) => (
                  <li key={item.label}><strong>{item.label}:</strong> {item.desc}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="text-lg font-black text-brand-blue flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-teal" /> {content.collegeSection}
              </h3>
              <ul className="mt-3 text-sm text-gray-700 space-y-2">
                {content.collegeItems.map((item) => (
                  <li key={item.label}><strong>{item.label}:</strong> {item.desc}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <section className="rounded-2xl border border-gray-200 p-5">
              <h4 className="font-black text-brand-blue flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-brand-teal" /> {content.patientFeatures}
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                {content.patientFeaturesDesc}
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 p-5">
              <h4 className="font-black text-brand-blue flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-brand-teal" /> {content.academicFeatures}
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                {content.academicFeaturesDesc}
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 p-5">
              <h4 className="font-black text-brand-blue flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-teal" /> {content.adminFeatures}
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                {content.adminFeaturesDesc}
              </p>
            </section>
          </div>

          <section className="rounded-2xl border border-brand-teal/30 bg-brand-light p-5">
            <h4 className="font-black text-brand-blue flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-teal" /> {content.highlights}
            </h4>
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              {content.highlightItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-3 sm:justify-between">
          <div className="flex gap-3">
            <Link
              to="/"
              onClick={closePopup}
              className="px-4 py-2 rounded-lg bg-brand-blue text-white font-semibold text-sm hover:bg-opacity-90"
            >
              {content.openHospital}
            </Link>
            <Link
              to="/college-home"
              onClick={closePopup}
              className="px-4 py-2 rounded-lg bg-brand-teal text-white font-semibold text-sm hover:bg-opacity-90"
            >
              {content.openCollege}
            </Link>
          </div>
          <button
            type="button"
            onClick={closePopup}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50"
          >
            {content.continue}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteWelcomePopup;