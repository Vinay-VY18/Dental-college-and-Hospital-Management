import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="bg-brand-blue text-white mt-12 py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-brand-teal">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1: Institution Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-18 w-18 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden border-3 border-brand-teal flex-shrink-0">
                <img 
                  src="https://media.istockphoto.com/id/1365134619/vector/dental-study-vector-logo-design-dental-university-logo-design-template.jpg?s=612x612&w=0&k=20&c=B95B2Psdlb4OU_UTgWPBt3NT1BXRISayJujNIez9-rI=" 
                  alt="Dental College Logo" 
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight uppercase tracking-wider">Dental College</h3>
                <p className="text-brand-teal text-xs font-bold">&amp; Hospital</p>
              </div>
            </div>
            <p className="text-sm text-brand-light opacity-80 leading-relaxed max-w-sm">
              {t.FOOTER_ABOUT_TEXT}
            </p>
            <div className="flex space-x-3">
              <span className="bg-brand-teal/20 border border-brand-teal/40 px-3 py-1.5 rounded-lg text-xs font-bold uppercase text-brand-teal tracking-widest leading-none flex items-center">
                {t.NAAC_GRADE}
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links & Regulatory */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-brand-teal font-bold text-xs uppercase tracking-[0.2em] mb-6">{t.QUICK_LINKS}</h4>
              <ul className="space-y-3 text-sm font-medium opacity-80">
                <li><Link to="/about" className="hover:text-brand-teal transition-all">{t.ABOUT}</Link></li>
                <li><Link to="/admissions" className="hover:text-brand-teal transition-all">{t.ADMISSIONS}</Link></li>
                <li><Link to="/departments" className="hover:text-brand-teal transition-all">{t.DEPARTMENTS}</Link></li>
                <li>
                  <Link 
                    to={sessionStorage.getItem('adminToken') ? "/admin/dashboard" : "/admin"} 
                    className="text-brand-teal font-bold text-xs uppercase hover:text-white transition-all underline decoration-brand-teal/30"
                  >
                    {t.STAFF_LOGIN}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-brand-teal font-bold text-xs uppercase tracking-[0.2em] mb-6">{t.REGULATORY}</h4>
              <ul className="space-y-3 text-sm font-medium opacity-80">
                <li>{t.DCI_APPROVED}</li>
                <li>{t.AFFILIATED_TO}</li>
              </ul>
            </div>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-6">
            <h4 className="text-brand-teal font-bold text-xs uppercase tracking-[0.2em] mb-6">{t.CONTACT}</h4>
            <div className="space-y-4 text-sm opacity-80">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-brand-teal shrink-0" />
                <span>{t.HOSPITAL_ADDRESS}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-brand-teal shrink-0" />
                <span>+91-80-28437150</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-brand-teal shrink-0" />
                <span>info@rrdch.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs font-medium opacity-85">
            &copy; {new Date().getFullYear()} RRDCH. {t.COPYRIGHT}
          </div>
          <div className="flex space-x-6 text-xs font-bold uppercase tracking-widest text-brand-teal">
            <Link to="#" className="hover:text-white transition-colors">{t.PRIVACY_POLICY}</Link>
            <Link to="#" className="hover:text-white transition-colors">{t.TERMS}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
