import { Award, Microscope, Users, GraduationCap } from 'lucide-react';

const CollegeAbout = () => {
  const pillars = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: 'Curriculum Strength',
      desc: 'Outcome-based teaching with integrated pre-clinical and clinical modules.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Mentorship',
      desc: 'Faculty-led mentorship programs for UG and PG academic progression.'
    },
    {
      icon: <Microscope className="w-6 h-6" />,
      title: 'Research Ecosystem',
      desc: 'Student and faculty research support through dedicated labs and projects.'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Academic Outcomes',
      desc: 'Consistent university performance and professional readiness of graduates.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-teal text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-5">College About: Building Future Dental Leaders</h1>
          <p className="text-brand-light text-lg max-w-3xl">
            This is the academic profile of RRDCH Dental College, focused on classroom rigor, clinical training, and research-oriented learning.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black text-brand-blue mb-6">Academic Vision</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-8">
              RRDCH College section is dedicated to high-quality dental education, structured training, and evidence-driven learning. The focus is on preparing students to become competent, ethical, and research-aware professionals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((item) => (
                <div key={item.title} className="bg-brand-light p-6 rounded-2xl border border-gray-100">
                  <div className="text-brand-teal mb-3">{item.icon}</div>
                  <h3 className="font-bold text-brand-blue mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-black text-brand-blue mb-4">College Snapshot</h3>
              <ul className="space-y-3 text-gray-700">
                <li>BDS and MDS streams with department-wise progression</li>
                <li>Continuous assessments and clinical competency tracking</li>
                <li>Academic calendar aligned with university standards</li>
                <li>Research guidance for UG and PG scholars</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeAbout;