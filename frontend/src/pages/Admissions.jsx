import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, MapPin, DollarSign, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations, deptMap } from '../utils/translations';

const Admissions = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeDept, setActiveDept] = useState('Oral Surgery');
  const [deptAdmissions, setDeptAdmissions] = useState([]);
  const [departmentDirectory, setDepartmentDirectory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const departments = [
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

  const departmentInsights = {
    'Oral Surgery': {
      duration: '3 Years (MDS)',
      focusAreas: ['Maxillofacial Trauma', 'Minor Oral Surgeries', 'Implantology'],
      clinicalExposure: 'OT postings, emergency triage, and post-operative management training.',
      careerPathways: ['Consultant Oral Surgeon', 'Hospital Surgical Unit', 'Academic Faculty']
    },
    Orthodontics: {
      duration: '3 Years (MDS)',
      focusAreas: ['Fixed Appliance Therapy', 'Aligner Workflows', 'Growth Modification'],
      clinicalExposure: 'Cephalometric planning, biomechanical case execution, and digital orthodontics.',
      careerPathways: ['Orthodontic Specialist', 'Smile Design Clinics', 'Teaching & Research']
    },
    Prosthodontics: {
      duration: '3 Years (MDS)',
      focusAreas: ['Crown & Bridge', 'Full Mouth Rehabilitation', 'Implant Prosthesis'],
      clinicalExposure: 'Comprehensive prosthetic planning, digital impressions, and occlusion labs.',
      careerPathways: ['Prosthodontic Specialist', 'Implant Practice', 'Academic Faculty']
    },
    Periodontics: {
      duration: '3 Years (MDS)',
      focusAreas: ['Periodontal Surgery', 'Regenerative Procedures', 'Implant Maintenance'],
      clinicalExposure: 'Gum surgeries, laser-assisted therapies, and preventive periodontal protocols.',
      careerPathways: ['Periodontist', 'Preventive Oral Care Specialist', 'Teaching Hospitals']
    },
    'Conservative Dentistry': {
      duration: '3 Years (MDS)',
      focusAreas: ['Restorative Dentistry', 'Endodontics', 'Aesthetic Restorations'],
      clinicalExposure: 'Microscopic endodontics, esthetic smile corrections, and trauma management.',
      careerPathways: ['Endodontist', 'Restorative Specialist', 'Private Clinical Practice']
    },
    'Oral Pathology': {
      duration: '3 Years (MDS)',
      focusAreas: ['Histopathology', 'Oral Lesion Diagnosis', 'Biopsy Interpretation'],
      clinicalExposure: 'Pathology labs, slide reading, and interdisciplinary diagnostic boards.',
      careerPathways: ['Oral Pathologist', 'Diagnostic Labs', 'Academic Research']
    },
    'Public Health Dentistry': {
      duration: '3 Years (MDS)',
      focusAreas: ['Community Dentistry', 'Epidemiology', 'Preventive Programs'],
      clinicalExposure: 'Field camps, oral health surveys, and public preventive intervention projects.',
      careerPathways: ['Public Health Specialist', 'NGO Programs', 'Government Oral Health Units']
    },
    Pedodontics: {
      duration: '3 Years (MDS)',
      focusAreas: ['Child Behavior Management', 'Preventive Pediatric Care', 'Interceptive Orthodontics'],
      clinicalExposure: 'Pediatric OPD, sedation-assisted procedures, and school dental outreach.',
      careerPathways: ['Pediatric Dentist', 'Child Dental Clinics', 'Academic Pediatric Dentistry']
    },
    'Oral Medicine': {
      duration: '3 Years (MDS)',
      focusAreas: ['Oral Diagnosis', 'Radiology', 'Medically Compromised Care'],
      clinicalExposure: 'Advanced oral medicine clinics, imaging interpretation, and referral management.',
      careerPathways: ['Oral Medicine Specialist', 'Diagnostic Centers', 'Hospital Referral Units']
    }
  };

  const admissionTimeline = {
    applicationWindow: 'January - March',
    counsellingRounds: 'April - June',
    courseCommences: 'August'
  };

  const selectedProfile = departmentDirectory.find((dept) => dept.name === activeDept) || null;
  const selectedInsights = departmentInsights[activeDept] || {
    duration: '3 Years (MDS)',
    focusAreas: [],
    clinicalExposure: t.ADMISSION_DEPT_PROFILE_PENDING,
    careerPathways: []
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchDepartmentDirectory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/academics/departments', {
          signal: controller.signal
        });
        setDepartmentDirectory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setDepartmentDirectory([]);
        }
      }
    };

    fetchDepartmentDirectory();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAdmissionData = async () => {
      if (!activeDept) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/admissions/${encodeURIComponent(activeDept)}`, {
          signal: controller.signal
        });
        const normalized = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];

        setDeptAdmissions(normalized);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error(err);
        setError('No specific data found for this department yet.');
        setDeptAdmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmissionData();
    return () => controller.abort();
  }, [activeDept]);

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <div className="bg-brand-blue text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4">{t.ADMISSIONS} 2026-27</h1>
          <p className="text-brand-teal text-xl font-medium">{t.ADMISSIONS_SUBTITLE}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Tabs */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-brand-teal" /> {t.DEPARTMENTS}
                </h3>
              </div>
              <div className="p-2 space-y-1">
                {departments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => setActiveDept(dept)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeDept === dept 
                      ? 'bg-brand-teal text-white shadow-md' 
                      : 'text-gray-600 hover:bg-teal-700 hover:text-white focus:ring-2 focus:ring-teal-500'
                    }`}
                  >
                    {language === 'KN' ? deptMap[dept] || dept : dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center shadow-sm border border-gray-100 animate-pulse">
                <div className="w-16 h-16 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-bold">Fetching Live Seat Matrix...</p>
              </div>
            ) : deptAdmissions.length > 0 ? (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Department Info Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 border-l-8 border-l-brand-teal">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-brand-blue mb-1">{language === 'KN' ? deptMap[activeDept] || activeDept : activeDept}</h2>
                      <p className="text-gray-500 font-bold flex items-center bg-gray-50 px-3 py-1 rounded-full w-max text-sm">
                        <Info className="mr-2 h-4 w-4 text-brand-teal" /> {deptAdmissions.map((row) => row.degree).join(' + ')} Program
                      </p>
                    </div>
                    <div className="bg-brand-teal bg-opacity-10 text-brand-teal px-6 py-3 rounded-2xl border border-brand-teal border-opacity-20">
                      <span className="text-xs uppercase font-black block tracking-wider">{t.STATUS}</span>
                      <span className="text-lg font-bold">{t.APPLICATION_STATUS}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                      <Info className="mr-3 text-brand-teal" /> {t.ADMISSION_DEPT_PROFILE}
                    </h3>
                    <div className="space-y-4 text-sm text-gray-700">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{t.ADMISSION_PROGRAM_DURATION}</p>
                        <p className="font-semibold text-brand-blue">{selectedInsights.duration}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{t.HOD}</p>
                        <p className="font-semibold text-brand-blue">{selectedProfile?.hod || t.NOT_AVAILABLE}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{t.ADMISSION_FACULTY_STRENGTH}</p>
                        <p className="font-semibold text-brand-blue">{selectedProfile?.facultyCount ?? 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">{t.ADMISSION_KEY_FOCUS}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedInsights.focusAreas.length > 0 ? selectedInsights.focusAreas.map((item) => (
                            <span key={item} className="px-3 py-1 rounded-full bg-brand-light text-brand-blue border border-blue-100 text-xs font-semibold">
                              {item}
                            </span>
                          )) : (
                            <span className="text-gray-500">{t.ADMISSION_DEPT_PROFILE_PENDING}</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{t.ADMISSION_CLINICAL_EXPOSURE}</p>
                        <p className="font-medium">{selectedInsights.clinicalExposure}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">{t.ADMISSION_CAREER_PATHS}</p>
                        <ul className="space-y-1 list-disc list-inside">
                          {selectedInsights.careerPathways.length > 0 ? selectedInsights.careerPathways.map((path) => (
                            <li key={path} className="font-medium">{path}</li>
                          )) : (
                            <li>{t.ADMISSION_DEPT_PROFILE_PENDING}</li>
                          )}
                        </ul>
                      </div>
                      {selectedProfile?.description && (
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{t.ADMISSION_DEPT_PROFILE}</p>
                          <p className="font-medium">{selectedProfile.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                      <CheckCircle className="mr-3 text-brand-teal" /> {t.ADMISSION_TIMELINE}
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-brand-light rounded-2xl border border-blue-100">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{t.ADMISSION_WINDOW}</p>
                        <p className="font-semibold text-brand-blue">{admissionTimeline.applicationWindow}</p>
                      </div>
                      <div className="p-4 bg-brand-light rounded-2xl border border-blue-100">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{t.ADMISSION_COUNSELLING}</p>
                        <p className="font-semibold text-brand-blue">{admissionTimeline.counsellingRounds}</p>
                      </div>
                      <div className="p-4 bg-brand-light rounded-2xl border border-blue-100">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{t.ADMISSION_COMMENCEMENT}</p>
                        <p className="font-semibold text-brand-blue">{admissionTimeline.courseCommences}</p>
                      </div>
                      <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium">
                        {t.ADMISSION_FETCHING_DEPT_PROFILE}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {deptAdmissions.map((program) => {
                    const availabilityRatio = program.totalSeats > 0 ? (program.availableSeats / program.totalSeats) : 0;
                    return (
                      <div key={program._id || `${activeDept}-${program.degree}`} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-black text-brand-blue">{program.degree} Program</h3>
                          <span className="px-3 py-1 rounded-full bg-brand-light text-brand-blue text-xs font-bold uppercase tracking-wide">
                            {t.APPLICATION_STATUS}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                          <div>
                            <h4 className="text-lg font-black text-gray-800 mb-4 flex items-center">
                              <MapPin className="mr-2 text-brand-teal" /> {t.SEAT_MATRIX}
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-end mb-1">
                                <span className="text-gray-500 font-bold text-sm">Availability</span>
                                <span className="text-brand-blue font-black text-2xl">{program.availableSeats}<span className="text-gray-300 text-sm font-normal ml-1">/ {program.totalSeats}</span></span>
                              </div>
                              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-1000 ease-out ${availabilityRatio < 0.2 ? 'bg-red-500' : 'bg-brand-teal'}`}
                                  style={{ width: `${Math.max(0, Math.min(100, availabilityRatio * 100))}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-lg font-black text-gray-800 mb-4 flex items-center">
                              <DollarSign className="mr-2 text-brand-teal" /> {t.FEE_STRUCTURE}
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-gray-600 font-bold">{t.TUITION_FEE}</span>
                                <span className="text-brand-blue font-black">₹{program.feeStructure?.tuition?.toLocaleString?.() ?? program.feeStructure?.tuition ?? '--'}</span>
                              </div>
                              <div className="flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-gray-600 font-bold">{t.HOSTEL_MESS}</span>
                                <span className="text-brand-blue font-black">₹{program.feeStructure?.hostel?.toLocaleString?.() ?? program.feeStructure?.hostel ?? '--'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-gray-800 mb-4 flex items-center">
                            <CheckCircle className="mr-2 text-brand-teal" /> {t.ELIGIBILITY}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(program.eligibility || []).map((item, idx) => (
                              <div key={`${program.degree}-${idx}`} className="flex items-start gap-3 p-4 bg-brand-light rounded-2xl border border-blue-50">
                                <div className="mt-1 bg-white p-1 rounded-full shadow-sm text-brand-teal">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                                <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center shadow-sm border border-gray-100 text-center">
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                  <Info className="h-12 w-12 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-brand-blue mb-2">Notice</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  {error || "Admission details for this department are being finalized. Please check back later or contact the helpdesk."}
                </p>
                <button className="bg-brand-blue text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-opacity-90 transition-all">
                  Contact Counselor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admissions;
