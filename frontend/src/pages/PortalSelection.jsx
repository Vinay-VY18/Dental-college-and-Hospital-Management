import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Hospital, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PortalSelection = () => {
  const { language } = useLanguage();
  const [activeGroup, setActiveGroup] = useState('hospital');

  const content = useMemo(() => {
    if (language === 'KN') {
      return {
        title: 'ವಿಭಾಗ ಆಯ್ಕೆ',
        subtitle: 'ಆಸ್ಪತ್ರೆ ಮತ್ತು ಕಾಲೇಜು ಅಕಾಡೆಮಿಕ್ ಪುಟಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಿಂದ ತೆರೆಯಿರಿ.',
        hospital: 'ಆಸ್ಪತ್ರೆ ಸೇವೆಗಳು',
        academics: 'ಕಾಲೇಜು ಅಕಾಡೆಮಿಕ್',
        groups: {
          hospital: [
            { name: 'ಮುಖಪುಟ', to: '/' },
            { name: 'ನಮ್ಮ ಬಗ್ಗೆ', to: '/about' },
            { name: 'ರೋಗಿಯ ಸೇವೆಗಳು', to: '/patient-portal' },
            { name: 'ಲೈವ್ ಕ್ಯೂ ಬೋರ್ಡ್', to: '/live-queue' },
            { name: 'ಪ್ರತಿಕ್ರಿಯೆ', to: '/feedback' },
            { name: 'ಸಂಪರ್ಕಿಸಿ', to: '/contact' }
          ],
          academics: [
            { name: 'ಪ್ರವೇಶಗಳು', to: '/admissions' },
            { name: 'ವಿಭಾಗಗಳು', to: '/departments' },
            { name: 'ಸಂಶೋಧನೆ', to: '/research' },
            { name: 'ವಿದ್ಯಾರ್ಥಿ ಸೇವೆಗಳು', to: '/student' },
            { name: 'ವಸತಿ ನಿಲಯ ಪೋರ್ಟಲ್', to: '/hostel' }
          ]
        }
      };
    }

    return {
      title: 'Portal Selection',
      subtitle: 'Choose a section and quickly access all Hospital and College Academic pages from one place.',
      hospital: 'Hospital Services',
      academics: 'College Academic',
      groups: {
        hospital: [
          { name: 'Home', to: '/' },
          { name: 'About', to: '/about' },
          { name: 'Patient Services', to: '/patient-portal' },
          { name: 'Live Queue Board', to: '/live-queue' },
          { name: 'Feedback', to: '/feedback' },
          { name: 'Contact', to: '/contact' }
        ],
        academics: [
          { name: 'Admissions', to: '/admissions' },
          { name: 'Departments', to: '/departments' },
          { name: 'Research', to: '/research' },
          { name: 'Student Services', to: '/student' },
          { name: 'Hostel Portal', to: '/hostel' }
        ]
      }
    };
  }, [language]);

  return (
    <div className="min-h-screen bg-brand-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-brand-blue text-white p-10">
            <h1 className="text-4xl font-bold mb-3">{content.title}</h1>
            <p className="text-brand-light text-lg max-w-3xl">{content.subtitle}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setActiveGroup('hospital')}
                className={`w-full p-5 rounded-2xl border-2 transition-all font-bold flex items-center justify-center gap-3 ${
                  activeGroup === 'hospital'
                    ? 'bg-brand-teal text-white border-brand-teal shadow-md'
                    : 'bg-white text-brand-blue border-brand-blue/20 hover:border-brand-teal'
                }`}
              >
                <Hospital className="w-5 h-5" />
                {content.hospital}
              </button>

              <button
                type="button"
                onClick={() => setActiveGroup('academics')}
                className={`w-full p-5 rounded-2xl border-2 transition-all font-bold flex items-center justify-center gap-3 ${
                  activeGroup === 'academics'
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                    : 'bg-white text-brand-blue border-brand-blue/20 hover:border-brand-blue'
                }`}
              >
                <Building2 className="w-5 h-5" />
                {content.academics}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.groups[activeGroup].map((page) => (
                <Link
                  key={page.to}
                  to={page.to}
                  className="group bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-semibold text-gray-700 hover:text-brand-blue hover:border-brand-teal hover:bg-white transition-all flex items-center justify-between"
                >
                  <span>{page.name}</span>
                  <ArrowRight className="w-4 h-4 opacity-85 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;
