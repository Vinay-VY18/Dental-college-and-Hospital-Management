import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, Filter, Layers, Database, Globe } from 'lucide-react';

const Research = () => {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResearch = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/college/research');
        setResearch(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchResearch();
  }, []);

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Search Header */}
      <div className="bg-brand-blue text-white pt-20 pb-32 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Advancing <span className="text-brand-teal">Dental Science</span></h1>
          <p className="text-brand-light opacity-80 mb-8 max-w-2xl mx-auto">
            Discover our latest clinical studies, innovations in maxillofacial surgery, and breakthrough research in restorative dentistry.
          </p>
          <div className="relative max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder="Search publications, authors, or topics..." 
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-brand-teal"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center">
                <Filter className="mr-2 h-4 w-4 text-brand-teal" /> Research Filter
              </h3>
              <div className="space-y-3">
                {['All Fields', 'Oral Surgery', 'Orthodontics', 'Periodontics', 'Implantology'].map(f => (
                  <label key={f} className="flex items-center space-x-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 accent-brand-teal" />
                    <span className="text-sm text-gray-800 group-hover:text-brand-blue font-medium">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-brand-teal p-6 rounded-3xl shadow-xl text-white">
              <Database className="w-10 h-10 mb-4 opacity-80" />
              <h4 className="font-bold text-xl mb-2">Research Repository</h4>
              <p className="text-sm opacity-80 mb-6">Access 1000+ indexed publications from our digital library.</p>
              <button className="bg-white text-brand-teal w-full py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50">Enter Portal</button>
            </div>
          </div>

          {/* Publications Feed */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-blue text-2xl">Recent Publications</h3>
              <div className="bg-white px-4 py-1.5 rounded-full border text-xs font-bold text-gray-800">Showing {research.length} results</div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white h-48 rounded-3xl border border-gray-100 shadow-sm"></div>
                ))}
              </div>
            ) : research.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {research.map((item, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-teal transition-all group">
                    <div className="flex flex-col md:flex-row gap-6">
                       <div className="bg-brand-light p-6 rounded-2xl flex items-center justify-center h-max group-hover:bg-brand-teal transition-colors">
                          <BookOpen className="w-8 h-8 text-brand-teal group-hover:text-white" />
                       </div>
                       <div className="flex-1">
                          <span className="text-xs font-bold text-brand-teal uppercase tracking-normaler mb-2 block">Clinical Research Paper 2026</span>
                          <h4 className="text-xl font-bold text-brand-blue mb-2 hover:text-brand-teal cursor-pointer">{item.title}</h4>
                          <p className="text-sm text-gray-800 font-bold mb-4 flex items-center">
                            <Layers className="mr-2 h-3.5 w-3.5" /> Published By: <span className="text-gray-800 ml-1">{item.authors}</span>
                          </p>
                          <p className="text-gray-800 leading-relaxed line-clamp-2 italic">
                            "{item.description}"
                          </p>
                          <div className="flex gap-4 mt-6">
                             <button className="text-xs font-bold text-brand-teal border-b-2 border-brand-teal pb-0.5 hover:text-brand-blue hover:border-brand-blue transition-colors">DOWNLOAD PDF</button>
                             <button className="text-xs font-bold text-gray-800 hover:text-brand-blue transition-colors">CITE PUBLICATION</button>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-300 text-center">
                <Globe className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <h4 className="text-xl font-bold text-gray-800">Library is Empty</h4>
                <p className="text-sm text-gray-300 max-w-xs mx-auto mt-2">Check back soon for latest entries from the Academic Council.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Research;
