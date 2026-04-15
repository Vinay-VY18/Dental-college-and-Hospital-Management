import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, FileText, Clock, Download } from 'lucide-react';

const Student = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/academics/syllabus')
      .then(res => setSyllabus(res.data))
      .catch(console.error);

    axios.get('http://localhost:5000/api/college/calendar')
      .then(res => setEvents(res.data))
      .catch(console.error);
  }, []);

  const schedules = [
    { dept: 'Oral Surgery', time: '09:00 AM - 12:00 PM', location: 'Clinic A' },
    { dept: 'Prosthodontics', time: '01:00 PM - 04:00 PM', location: 'Lab 2' },
    { dept: 'Orthodontics', time: '09:00 AM - 01:00 PM', location: 'Clinic B' },
  ];

  return (
    <div className="min-h-screen bg-brand-light py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-blue mb-8 border-b-2 border-brand-teal pb-4 inline-block">Student Services & Academic Portal</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Syllabus Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-brand-blue text-white py-4 px-6 flex items-center">
                <FileText className="mr-3 h-5 w-5" />
                <h2 className="text-xl font-semibold">Syllabus Updates (PDF)</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {syllabus.length > 0 ? syllabus.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:border-brand-teal transition-colors bg-gray-50">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.year} BDS</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <a href={item.fileLink || '#'} className="mt-3 sm:mt-0 flex items-center px-4 py-2 bg-white border border-gray-300 rounded text-brand-teal font-medium hover:bg-brand-light transition-colors shadow-sm self-start sm:self-auto">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </a>
                    </div>
                  )) : <div className="text-gray-400 text-center py-4">Loading Syllabus...</div>}
                </div>
              </div>
            </div>

            {/* Department Schedules */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-brand-teal text-white py-4 px-6 flex items-center">
                <Clock className="mr-3 h-5 w-5" />
                <h2 className="text-xl font-semibold">Department Clinical Schedules</h2>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-6 font-semibold text-gray-700">Department</th>
                      <th className="py-3 px-6 font-semibold text-gray-700">Timing</th>
                      <th className="py-3 px-6 font-semibold text-gray-700">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-6 text-brand-blue font-medium">{schedule.dept}</td>
                        <td className="py-3 px-6 text-gray-600">{schedule.time}</td>
                        <td className="py-3 px-6 text-gray-600">{schedule.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Calendar of Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-brand-blue text-white py-4 px-6 flex items-center">
                <Calendar className="mr-3 h-5 w-5" />
                <h2 className="text-xl font-semibold">Calendar of Events</h2>
              </div>
              <div className="p-6 space-y-5">
                {events.length > 0 ? events.map((event, idx) => (
                  <div key={idx} className="flex relative pl-5 before:absolute before:left-0 before:top-1.5 before:w-3 before:h-3 before:rounded-full before:bg-brand-teal">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-brand-teal mb-1">{event.date}</div>
                      <h4 className="text-gray-800 font-medium leading-tight">{event.title}</h4>
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">{event.type}</span>
                    </div>
                  </div>
                )) : <div className="text-gray-400 text-sm">No upcoming events.</div>}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-brand-teal text-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Quick Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:underline flex items-center opacity-90"><span className="mr-2">👉</span> Library Portal</a></li>
                <li><a href="#" className="hover:underline flex items-center opacity-90"><span className="mr-2">👉</span> Research Guidelines</a></li>
                <li><a href="/hostel" className="hover:underline flex items-center opacity-90"><span className="mr-2">👉</span> Hostel Portal</a></li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Student;
