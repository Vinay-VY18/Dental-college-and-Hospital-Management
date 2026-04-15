import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import InteractiveMap from '../components/InteractiveMap';
import VideoModal from '../components/VideoModal';

const Home = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // YouTube video URL for Rajarajeswari Dental College campus tour
  const campusVideoUrl = 'https://www.youtube.com/embed/2uXf2_H-bNU';

  const topDoctors = [
    {
      name: t.HOSPITAL_DOCTOR_1_NAME,
      specialization: t.HOSPITAL_DOCTOR_1_SPECIALIZATION,
      department: t.HOSPITAL_DOCTOR_1_DEPARTMENT,
      image:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=900&h=1100'
    },
    {
      name: t.HOSPITAL_DOCTOR_2_NAME,
      specialization: t.HOSPITAL_DOCTOR_2_SPECIALIZATION,
      department: t.HOSPITAL_DOCTOR_2_DEPARTMENT,
      image:
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=900&h=1100'
    },
    {
      name: t.HOSPITAL_DOCTOR_3_NAME,
      specialization: t.HOSPITAL_DOCTOR_3_SPECIALIZATION,
      department: t.HOSPITAL_DOCTOR_3_DEPARTMENT,
      image:
        'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=900&h=1100'
    }
  ];

  const departmentHighlights = [
    {
      name: t.ORAL_SURGERY,
      info: t.HOSPITAL_DEPT_ORAL_INFO,
      image:
        'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=1000&h=700'
    },
    {
      name: t.ORTHODONTICS,
      info: t.HOSPITAL_DEPT_ORTHO_INFO,
      image:
        'https://images.unsplash.com/photo-1576091160588-112fa4248e94?auto=format&fit=crop&q=80&w=1000&h=700'
    },
    {
      name: t.PROSTHODONTICS,
      info: t.HOSPITAL_DEPT_PROSTHO_INFO,
      image:
        'https://images.unsplash.com/photo-1579154204601-01d6cc01b2ea?auto=format&fit=crop&q=80&w=1000&h=700'
    },
    {
      name: t.PERIODONTICS,
      info: t.HOSPITAL_DEPT_PERIO_INFO,
      image:
        'https://images.unsplash.com/photo-1587582391202-d3979e5e0f91?auto=format&fit=crop&q=80&w=1000&h=700'
    },
    {
      name: t.GENERAL_CHECKUP,
      info: t.HOSPITAL_DEPT_GENERAL_INFO,
      image:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1000&h=700'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-blue text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex border-l-4 border-brand-teal pl-8 shadow-sm">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t.HOSPITAL_HOME_TITLE}
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl text-brand-light">
              {t.HOSPITAL_HOME_SUB}
            </p>
            <div className="flex space-x-4">
              <Link to="/patient-portal" className="bg-brand-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-all flex items-center shadow-lg">
                {t.BOOK_APPOINTMENT} <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/contact" className="bg-white text-brand-blue px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-all shadow-lg">
                {t.EMERGENCY_CONTACTS}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Highlight Section */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-brand-teal mb-2">25+</div>
              <div className="text-gray-600 font-medium">{t.YEARS_OF_CLINICAL_SERVICE}</div>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-brand-teal mb-2">15k+</div>
              <div className="text-gray-600 font-medium">{t.PATIENTS_TREATED}</div>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-brand-teal mb-2">9</div>
              <div className="text-gray-600 font-medium">{t.HOSPITAL_SPECIALTIES}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Doctors + Department Highlights */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-blue mb-4">{t.HOSPITAL_TOP_DOCTORS_TITLE}</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              {t.HOSPITAL_TOP_DOCTORS_SUB}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            {topDoctors.map((doctor) => (
              <article key={doctor.name} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-72 object-cover object-top"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-brand-blue">{doctor.name}</h3>
                  <p className="text-brand-teal font-semibold mt-2">{doctor.specialization}</p>
                  <p className="text-sm text-gray-600 mt-3">
                    {t.DEPARTMENT}: <span className="font-medium text-gray-800">{doctor.department}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-brand-blue mb-3 text-center">{t.HOSPITAL_DEPARTMENT_INFO_TITLE}</h3>
            <p className="text-gray-600 max-w-3xl mx-auto text-center mb-8">{t.HOSPITAL_DEPARTMENT_INFO_SUB}</p>

            <style>{`
              @keyframes scroll-left {
                0% {
                  transform: translateX(100%);
                }
                100% {
                  transform: translateX(-100%);
                }
              }
              .carousel-container {
                animation: scroll-left 30s linear infinite;
              }
              .carousel-container:hover {
                animation-play-state: paused;
              }
            `}</style>

            <div className="overflow-hidden bg-gradient-to-r from-brand-light via-white to-brand-light py-8 rounded-xl">
              <div className="carousel-container flex gap-6 px-4">
                {[...departmentHighlights, ...departmentHighlights].map((dept, idx) => (
                  <div key={idx} className="flex-shrink-0 w-80">
                    <div className="bg-white rounded-lg border-2 border-brand-teal p-6 shadow-lg h-full hover:shadow-2xl transition-shadow duration-300">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center">
                          <span className="text-white text-xl font-bold">🏥</span>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-brand-blue mb-3 text-center">{dept.name}</h4>
                      <p className="text-gray-600 leading-relaxed text-sm">{dept.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Tour Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-blue mb-4">{t.HOSPITAL_VIRTUAL_TOUR_TITLE}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">{t.HOSPITAL_VIRTUAL_TOUR_DESCRIPTION}</p>
          </div>
          <div 
            onClick={() => setIsVideoOpen(true)}
            className="relative aspect-video rounded-xl bg-gray-900 shadow-xl overflow-hidden flex items-center justify-center border-4 border-brand-teal group cursor-pointer hover:border-brand-teal hover:shadow-2xl transition-all duration-300"
          >
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200&h=675" 
              alt="Hospital Campus" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300"
            />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="h-20 w-20 bg-brand-teal rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <div className="w-0 h-0 border-t-12 border-t-transparent border-l-20 border-l-white border-b-12 border-b-transparent ml-2"></div>
              </div>
              <span className="font-semibold text-lg drop-shadow-md text-white">{t.PLAY_TOUR}</span>
            </div>
          </div>

          {/* Info Icons Below Video */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🏥</div>
              <h4 className="font-bold text-gray-800 mb-1">Campus Facilities</h4>
              <p className="text-sm text-gray-600">Explore state-of-the-art dental facilities</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📚</div>
              <h4 className="font-bold text-gray-800 mb-1">Learning Spaces</h4>
              <p className="text-sm text-gray-600">Modern classrooms and clinical labs</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">👥</div>
              <h4 className="font-bold text-gray-800 mb-1">Campus Life</h4>
              <p className="text-sm text-gray-600">Experience our vibrant community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal 
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={campusVideoUrl}
        title="Rajarajeswari Dental College and Hospital - Campus Virtual Tour"
      />

      {/* Location Map Section */}
      <section className="py-20 bg-brand-light scroll-mt-32" id="map-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-brand-blue mb-2">{t.HOSPITAL_DIRECTIONS_MAP || 'Find Us on Map'}</h2>
            <p className="text-gray-600">{t.HOSPITAL_MAP_SUB || 'Live interactive map with real-time location and distance calculation'}</p>
          </div>
          
          <div className="w-full">
            <InteractiveMap 
              title="Hospital Location" 
              address="Rajarajeswari Dental College and Hospital, Kumbalgodu, Bangalore"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
