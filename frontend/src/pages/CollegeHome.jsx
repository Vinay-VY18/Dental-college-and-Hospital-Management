import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowRight, Trophy, Medal, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { deptMap, translations } from '../utils/translations';
import InteractiveMap from '../components/InteractiveMap';

const CollegeHome = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [topperIndex, setTopperIndex] = useState(0);
  const [achievementIndex, setAchievementIndex] = useState(0);
  const [admissions, setAdmissions] = useState([]);
  const [departmentProfiles, setDepartmentProfiles] = useState([]);
  const [selectedDept, setSelectedDept] = useState('Oral Surgery');
  const [isAdmissionLoading, setIsAdmissionLoading] = useState(true);

  const collegeDepartments = [
    'Oral Surgery',
    'Orthodontics',
    'Prosthodontics',
    'Periodontics',
    'Conservative Dentistry',
    'Oral Pathology',
    'Public Health Dentistry',
    'Pedodontics',
    'Oral Medicine'
  ];

  const toppers = [
    { name: 'Dr. Ananya R', program: 'MDS Orthodontics', score: '92.4%' },
    { name: 'Dr. Karthik S', program: 'MDS Oral Surgery', score: '91.8%' },
    { name: 'Dr. Nithya P', program: 'BDS Final Year', score: '90.6%' },
    { name: 'Dr. Vivek H', program: 'MDS Prosthodontics', score: '89.9%' },
    { name: 'Dr. Harshita N', program: 'BDS Third Year', score: '89.5%' }
  ];

  const achievements = [
    { title: 'National Clinical Quiz Winner', detail: 'RRDCH PG team secured 1st place in inter-collegiate nationals.' },
    { title: 'Research Paper Excellence', detail: '12 indexed publications accepted by faculty and PG scholars this term.' },
    { title: 'Community Outreach Milestone', detail: '10,000+ beneficiaries covered through oral screening and awareness drives.' },
    { title: 'Innovation in Digital Dentistry', detail: 'Live CAD/CAM and 3D workflow training integrated for final-year students.' },
    { title: 'University Top Rank', detail: 'RRDCH students achieved top university ranks in BDS and MDS examinations.' }
  ];

  useEffect(() => {
    const controller = new AbortController();

    const fetchAdmissionBlockData = async () => {
      setIsAdmissionLoading(true);
      try {
        const [admissionRes, departmentRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admissions', { signal: controller.signal }),
          axios.get('http://localhost:5000/api/academics/departments', { signal: controller.signal })
        ]);

        const admissionRows = Array.isArray(admissionRes.data) ? admissionRes.data : [];
        const filteredRows = admissionRows
          .filter((row) => row.active !== false && collegeDepartments.includes(row.department))
          .sort((a, b) => collegeDepartments.indexOf(a.department) - collegeDepartments.indexOf(b.department));

        setAdmissions(filteredRows);
        setDepartmentProfiles(Array.isArray(departmentRes.data) ? departmentRes.data : []);

        if (filteredRows.length > 0 && !filteredRows.some((row) => row.department === selectedDept)) {
          setSelectedDept(filteredRows[0].department);
        }
      } catch {
        setAdmissions([]);
      } finally {
        setIsAdmissionLoading(false);
      }
    };

    fetchAdmissionBlockData();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTopperIndex((prev) => (prev + 1) % toppers.length);
      setAchievementIndex((prev) => (prev + 1) % achievements.length);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [toppers.length, achievements.length]);

  const currentTopper = toppers[topperIndex];
  const currentAchievement = achievements[achievementIndex];
  const departmentTabs = Array.from(new Set(admissions.map((item) => item.department)));
  const selectedAdmissions = admissions.filter((item) => item.department === selectedDept);
  const selectedProfile = departmentProfiles.find((item) => item.name === selectedDept) || null;

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-brand-teal text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 border-l-4 border-white/70 pl-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t.COLLEGE_HOME_TITLE}
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl text-brand-light">
              {t.COLLEGE_HOME_SUB}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/admissions" className="bg-white text-brand-teal px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center">
                {t.COLLEGE_EXPLORE_ADMISSIONS} <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/research" className="bg-brand-blue text-white px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-all shadow-lg">
                {t.COLLEGE_VIEW_RESEARCH}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-brand-teal mb-2">BDS + MDS</div>
              <div className="text-gray-800 font-medium">{t.COLLEGE_STRUCTURED_PROGRAMS}</div>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-brand-teal mb-2">9</div>
              <div className="text-gray-800 font-medium">{t.COLLEGE_ACADEMIC_DEPARTMENTS}</div>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-brand-teal mb-2">5000+</div>
              <div className="text-gray-800 font-medium">{t.COLLEGE_ALUMNI_NETWORK}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-brand-blue mb-2">{t.COLLEGE_ADMISSION_BLOCK_TITLE}</h2>
            <p className="text-gray-800">{t.COLLEGE_ADMISSION_BLOCK_SUB}</p>
          </div>

          {isAdmissionLoading ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-gray-800 font-semibold">
              {t.COLLEGE_ADMISSION_LOADING}
            </div>
          ) : admissions.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-gray-800 font-semibold">
              {t.COLLEGE_ADMISSION_NO_DATA}
            </div>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-3 mb-8">
                {departmentTabs.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-colors ${selectedDept === dept ? 'bg-brand-teal text-white border-brand-teal' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-teal hover:text-brand-blue'}`}
                  >
                    {language === 'KN' ? deptMap[dept] || dept : dept}
                  </button>
                ))}
              </div>

              {selectedAdmissions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <article className="lg:col-span-2 bg-brand-light rounded-2xl border border-blue-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                      <div>
                        <h3 className="text-2xl font-bold text-brand-blue">{language === 'KN' ? deptMap[selectedDept] || selectedDept : selectedDept}</h3>
                        <p className="text-sm text-gray-800 mt-1">{t.COLLEGE_ADMISSION_PROGRAM}: {selectedAdmissions.map((item) => item.degree).join(' + ')}</p>
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-white border border-blue-100 text-sm font-bold text-brand-blue">
                        {t.APPLICATION_STATUS}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedAdmissions.map((program) => {
                        const seatPercent = program.totalSeats > 0
                          ? Math.max(0, Math.min(100, Math.round((program.availableSeats / program.totalSeats) * 100)))
                          : 0;

                        return (
                          <div key={program._id || `${program.department}-${program.degree}`} className="bg-white border border-gray-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-bold text-brand-blue">{program.degree}</h4>
                              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">{t.SEAT_MATRIX}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-2xl font-bold text-brand-blue">{program.availableSeats} / {program.totalSeats}</p>
                                <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-teal" style={{ width: `${seatPercent}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-800 mt-2">{t.COLLEGE_ADMISSION_SEAT_TEXT}: {seatPercent}%</p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-700 font-semibold">{t.TUITION_FEE}: <span className="text-brand-blue">₹{program.feeStructure?.tuition?.toLocaleString?.() ?? program.feeStructure?.tuition ?? '--'}</span></p>
                                <p className="text-sm text-gray-700 font-semibold mt-2">{t.HOSTEL_MESS}: <span className="text-brand-blue">₹{program.feeStructure?.hostel?.toLocaleString?.() ?? program.feeStructure?.hostel ?? '--'}</span></p>
                              </div>
                            </div>

                            <p className="text-xs text-gray-800 uppercase tracking-wide font-bold mb-2">{t.ELIGIBILITY}</p>
                            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                              {(program.eligibility || []).slice(0, 3).map((rule, idx) => (
                                <li key={`${program.degree}-${idx}`}>{rule}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </article>

                  <article className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-brand-blue mb-4">{t.COLLEGE_ADMISSION_DEPT_INFO}</h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p><span className="font-semibold text-gray-800">{t.HOD}:</span> {selectedProfile?.hod || t.NOT_AVAILABLE}</p>
                      <p><span className="font-semibold text-gray-800">{t.FACULTY_SIZE}:</span> {selectedProfile?.facultyCount ?? 0}</p>
                      <p className="leading-relaxed"><span className="font-semibold text-gray-800">{t.COLLEGE_ADMISSION_OVERVIEW}:</span> {selectedProfile?.description || t.COLLEGE_ADMISSION_OVERVIEW_FALLBACK}</p>
                    </div>

                    <Link
                      to="/admissions"
                      className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-brand-blue text-white text-sm font-bold hover:bg-opacity-90"
                    >
                      {t.COLLEGE_ADMISSION_VIEW_MORE} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </article>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-brand-blue mb-2">{t.COLLEGE_LIVE_TOPPERS_TITLE}</h2>
              <p className="text-gray-800 text-lg">{t.COLLEGE_LIVE_TOPPERS_SUB}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-bold w-max">
              <Activity className="w-4 h-4 animate-pulse" />
              {t.COLLEGE_LIVE_BADGE}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <article className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-brand-blue mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                {t.COLLEGE_CURRENT_TOPPER}
              </h3>
              <p className="text-2xl font-bold text-gray-800">{currentTopper.name}</p>
              <p className="text-sm text-gray-800 mt-2">{t.COLLEGE_PROGRAM_LABEL}: {currentTopper.program}</p>
              <p className="text-sm text-gray-800">{t.COLLEGE_SCORE_LABEL}: <span className="font-bold text-brand-blue">{currentTopper.score}</span></p>
            </article>

            <article className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-brand-blue mb-4 flex items-center">
                <Medal className="w-5 h-5 mr-2 text-brand-teal" />
                {t.COLLEGE_CURRENT_ACHIEVEMENT}
              </h3>
              <p className="text-lg font-bold text-gray-800">{currentAchievement.title}</p>
              <p className="text-sm text-gray-800 mt-2">{t.COLLEGE_HIGHLIGHT_LABEL}: {currentAchievement.detail}</p>
            </article>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <h4 className="font-bold text-gray-700 mb-3">{t.COLLEGE_TOPPERS_FEED}</h4>
              <div className="space-y-2">
                {toppers.map((item, idx) => (
                  <div
                    key={item.name}
                    className={`px-3 py-2 rounded-lg border text-sm ${idx === topperIndex ? 'bg-white border-brand-teal text-brand-blue font-bold' : 'bg-white border-gray-200 text-gray-800'}`}
                  >
                    {item.name} - {item.score}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <h4 className="font-bold text-gray-700 mb-3">{t.COLLEGE_ACHIEVEMENTS_FEED}</h4>
              <div className="space-y-2">
                {achievements.map((item, idx) => (
                  <div
                    key={item.title}
                    className={`px-3 py-2 rounded-lg border text-sm ${idx === achievementIndex ? 'bg-white border-brand-teal text-brand-blue font-bold' : 'bg-white border-gray-200 text-gray-800'}`}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold tracking-wide text-gray-800 uppercase">
            {t.COLLEGE_ROTATES_EVERY_3}
          </p>
        </div>
      </section>

      {/* Campus Location Map Section */}
      <section className="py-20 bg-white border-t border-gray-100 scroll-mt-32" id="map-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-brand-teal mb-2">{t.COLLEGE_LOCATION || 'Visit Our Campus'}</h2>
            <p className="text-gray-800">{t.COLLEGE_LOCATION_SUB || 'Interactive map showing our location with real-time distance calculation'}</p>
          </div>
          
          <div className="w-full">
            <InteractiveMap 
              title="Campus Location" 
              address="Rajarajeswari Dental College and Hospital, Kumbalgodu, Bangalore"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CollegeHome;
