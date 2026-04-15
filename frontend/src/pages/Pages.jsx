import { useState, useEffect } from 'react';
import axios from 'axios';

const GenericPage = ({ title, defaultDescription, endpoint }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!endpoint) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/${endpoint}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-light pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-xl shadow-sm p-10 border border-gray-100 border-t-4 border-t-brand-teal">
          <h1 className="text-3xl font-bold text-brand-blue mb-6">{title}</h1>
          <p className="text-gray-600 leading-relaxed text-lg mb-6">
            {defaultDescription}
          </p>
          
          {loading ? (
            <div className="text-center text-gray-400 py-10">Syncing with Remote Database...</div>
          ) : data.length > 0 ? (
            <div className="space-y-6 mt-8">
              {data.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-brand-blue mb-2">{item.name || item.title || item.year}</h3>
                  {item.authors && <p className="text-sm text-brand-teal font-semibold mb-2">By: {item.authors}</p>}
                  {item.hod && <p className="text-sm text-brand-teal font-semibold mb-2">HOD: {item.hod}</p>}
                  {item.facultyCount !== undefined && <p className="text-sm text-gray-500 font-semibold mb-2">Faculty Count: {item.facultyCount}</p>}
                  <p className="text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
              Content Managed via Admin Panel
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Departments = () => <GenericPage title="Departments" endpoint="academics/departments" defaultDescription="Our specialized departments feature advanced technology and experienced faculty." />;
