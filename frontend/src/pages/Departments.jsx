import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, MapPin, Award, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations, deptMap } from '../utils/translations';

const Departments = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [activeDept, setActiveDept] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [deptRes, facRes] = await Promise.all([
          axios.get('http://localhost:5000/api/academics/departments'),
          axios.get('http://localhost:5000/api/college/faculty')
        ]);
        setDepartments(deptRes.data);
        setFaculty(facRes.data);
        if (deptRes.data.length > 0) setActiveDept(deptRes.data[0]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="bg-brand-blue text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.DEPARTMENTS}</h1>
          <p className="text-brand-teal text-xl font-medium tracking-normal">Centers of clinical excellence and specialized dental training.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Dept List Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-brand-blue flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-brand-teal" /> Specialties
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {departments.map(dept => (
                  <button
                    key={dept._id}
                    onClick={() => setActiveDept(dept)}
                    className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                      activeDept?._id === dept._id 
                      ? 'bg-brand-teal text-white shadow-xl translate-x-1' 
                      : 'text-gray-800 hover:bg-teal-700 hover:text-white focus:ring-2 focus:ring-teal-500'
                    }`}
                  >
                    {language === 'KN' ? deptMap[dept.name] || dept.name : dept.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dept Detail Content */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center shadow-sm animate-pulse">
                <div className="w-16 h-16 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mb-4"></div>
              </div>
            ) : activeDept ? (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Intro Section */}
                <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BookOpen className="w-40 h-40" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                       <span className="bg-brand-teal text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Department</span>
                       <h2 className="text-4xl font-bold text-brand-blue">{language === 'KN' ? deptMap[activeDept.name] || activeDept.name : activeDept.name}</h2>
                    </div>
                    <p className="text-gray-800 text-lg leading-relaxed mb-8 max-w-3xl">
                      {activeDept.description}
                    </p>
                    <div className="flex flex-wrap gap-8 pt-8 border-t">
                      <div>
                        <div className="text-xs text-brand-teal font-bold uppercase mb-1">{t.HOD}</div>
                        <div className="text-lg font-bold text-gray-800">{activeDept.hod}</div>
                      </div>
                      <div>
                        <div className="text-xs text-brand-teal font-bold uppercase mb-1">{t.FACULTY_SIZE}</div>
                        <div className="text-lg font-bold text-gray-800">{activeDept.facultyCount} Specialists</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Faculty Gallery */}
                <div>
                  <h3 className="text-2xl font-bold text-brand-blue mb-8 flex items-center">
                    <Users className="mr-3 text-brand-teal" /> Faculty Gallery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {faculty.filter(f => f.department === activeDept.name).map((f, i) => (
                      <div key={i} className="bg-white rounded-3xl p-6 shadow-md border border-gray-50 group hover:border-brand-teal transition-all flex flex-col">
                        <div className="w-full aspect-square bg-brand-light rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center">
                           {f.image ? (
                             <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                           ) : (
                             <Users className="w-20 h-20 text-brand-teal/20" />
                           )}
                           <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/10 transition-colors"></div>
                        </div>
                        <h4 className="text-lg font-bold text-brand-blue">{f.name}</h4>
                        <p className="text-xs font-bold text-brand-teal uppercase mb-4">{f.designation}</p>
                        <div className="mt-auto pt-4 border-t border-dashed">
                           <div className="flex items-center text-xs text-gray-800 font-bold">
                             <Award className="w-3 h-3 mr-2" /> {f.experience} Experience
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Departments;
