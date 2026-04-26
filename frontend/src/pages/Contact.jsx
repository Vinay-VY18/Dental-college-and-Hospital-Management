import { MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

export const Contact = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-brand-blue py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">{t.CONTACT_INFO_TITLE}</h1>
        <p className="opacity-90 max-w-xl mx-auto">{t.CONTACT_INFO_SUB}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="flex flex-col items-center text-center p-8 bg-brand-light rounded-xl border border-gray-100 shadow-sm">
            <div className="h-14 w-14 bg-brand-teal text-white rounded-full flex items-center justify-center mb-4">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t.PHONE}</h3>
            <p className="text-gray-800">{t.RECEPTION}: 080-28437150</p>
            <p className="text-gray-800">{t.EMERGENCY}: 080-28437468</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-8 bg-brand-light rounded-xl border border-gray-100 shadow-sm">
            <div className="h-14 w-14 bg-brand-teal text-white rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t.EMAIL}</h3>
            <p className="text-gray-800">info@rrdch.org</p>
            <p className="text-gray-800">admissions@rrdch.org</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-8 bg-brand-light rounded-xl border border-gray-100 shadow-sm">
            <div className="h-14 w-14 bg-brand-teal text-white rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t.LOCATION}</h3>
            <p className="text-gray-800">{t.HOSPITAL_ADDRESS}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
