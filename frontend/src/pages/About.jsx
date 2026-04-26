import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Clock, Users, Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const About = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/college/hospital-events');
        setEvents(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-brand-blue py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0 L100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {t.HOSPITAL_ABOUT_TITLE_PRE} <span className="text-brand-teal">{t.HOSPITAL_ABOUT_HIGHLIGHT}</span> {t.HOSPITAL_ABOUT_TITLE_POST}
              </h1>
              <p className="text-brand-light text-lg mb-8 opacity-90 max-w-lg">
                {t.HOSPITAL_ABOUT_DESC}
              </p>
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-white">20+</div>
                  <div className="text-xs text-brand-teal uppercase font-bold tracking-widest">{t.YEARS_OF_SERVICE}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-white">5000+</div>
                  <div className="text-xs text-brand-teal uppercase font-bold tracking-widest">{t.CLINICAL_CASES}</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="w-full h-80 bg-brand-teal/20 rounded-3xl border border-white/10 backdrop-blur-sm overflow-hidden flex items-center justify-center">
                   <div className="text-white text-center p-8">
                     <Award className="w-20 h-20 mx-auto text-brand-teal mb-4" />
                     <h3 className="text-2xl font-bold">{t.NAAC_GRADE}</h3>
                     <p className="text-sm opacity-90">{t.HOSPITAL_ABOUT_BADGE_DESC}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-brand-blue mb-6 flex items-center">
                <div className="w-10 h-1 bg-brand-teal mr-4 rounded-full"></div> {t.OUR_HOSPITAL_MISSION}
              </h2>
              <p className="text-gray-800 text-lg leading-relaxed">
                {t.HOSPITAL_MISSION_DESC}
              </p>
            </section>

            <section className="bg-brand-light p-10 rounded-3xl border border-blue-50">
              <h2 className="text-2xl font-bold text-brand-blue mb-6">{t.HOSPITAL_SERVICE_PILLARS}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: t.SPECIALIST_CONSULTATIONS, desc: t.SPECIALIST_CONSULTATIONS_DESC, icon: <Award /> },
                  { title: t.HIGH_OPD_CAPACITY, desc: t.HIGH_OPD_CAPACITY_DESC, icon: <Users /> },
                  { title: t.MODERN_TREATMENT_SYSTEMS, desc: t.MODERN_TREATMENT_SYSTEMS_DESC, icon: <Clock /> },
                  { title: t.COMMUNITY_DENTAL_OUTREACH, desc: t.COMMUNITY_DENTAL_OUTREACH_DESC, icon: <MapPin /> }
                ].map((p, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-brand-teal transition-all">
                    <div className="text-brand-teal mb-4 group-hover:scale-110 transition-transform">{p.icon}</div>
                    <h4 className="font-bold text-gray-800 mb-2">{p.title}</h4>
                    <p className="text-sm text-gray-800">{p.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* News & Events Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-3xl shadow-xl overflow-hidden sticky top-6">
              <div className="bg-brand-blue p-6 text-white text-center">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-brand-teal" />
                <h3 className="text-xl font-bold">{t.UPCOMING_EVENTS}</h3>
                <p className="text-xs opacity-85">{t.LIVE_BULLETIN}</p>
              </div>
              <div className="p-6 space-y-6">
                {loading ? (
                  <div className="text-center py-10 opacity-70 italic">{t.SYNCING_CALENDAR}</div>
                ) : events.length > 0 ? (
                  events.map((evt, idx) => (
                    <div key={idx} className="flex gap-4 border-b pb-4 last:border-0">
                      <div className="bg-brand-light text-brand-blue p-2 rounded-xl text-center min-w-15 h-max">
                        <div className="text-lg font-bold">{evt.date.split(' ')[0]}</div>
                        <div className="text-xs uppercase font-bold opacity-90">{evt.date.split(' ')[1]}</div>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-brand-blue mb-1">{evt.title}</h4>
                        <span className="text-xs bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full font-bold uppercase">{evt.type}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-800 text-center py-10">{t.NO_EVENTS_SCHEDULED}</div>
                )}
                <button className="w-full bg-brand-teal text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-opacity">
                  {t.VIEW_FULL_CALENDAR}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
