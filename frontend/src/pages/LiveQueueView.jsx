import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Clock, Activity, Users } from 'lucide-react';
import io from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import { translations, deptMap } from '../utils/translations';

const LiveQueueView = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const socketRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const [selectedDept, setSelectedDept] = useState('General Checkup');
  const [liveData, setLiveData] = useState({ currentToken: 0, waitingCount: 0 });
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const departments = [
    { id: 'Oral Surgery', name: 'Oral Surgery' },
    { id: 'Orthodontics', name: 'Orthodontics' },
    { id: 'Prosthodontics', name: 'Prosthodontics' },
    { id: 'General Checkup', name: 'General Checkup' }
  ];

  // Fetch queue data from HTTP endpoint
  const fetchQueue = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/patients/live-status/${encodeURIComponent(selectedDept)}`);
      if (res.data.success) {
        setLiveData({
          currentToken: res.data.currentToken,
          waitingCount: res.data.waitingCount
        });
      }
    } catch (err) {
      console.error('Queue fetch error:', err);
    }
  };

  useEffect(() => {
    // 1. Initialize HTTP polling as fallback
    fetchQueue();
    pollIntervalRef.current = setInterval(fetchQueue, 15000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedDept]);

  useEffect(() => {
    // 2. Initialize Socket.IO connection
    try {
      const socket = io('http://localhost:5000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setConnectionStatus('connected');
        // Request current queue status for selected department
        socket.emit('requestQueueStatus', selectedDept);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnectionStatus('disconnected');
      });

      // 3. Listen for real-time queue updates
      socket.on('queueUpdate', (data) => {
        console.log('Queue update received:', data);
        // Only update if it's for the selected department
        if (data.department === selectedDept) {
          setLiveData({
            currentToken: data.currentToken,
            waitingCount: data.waitingCount
          });
        }
      });

      socket.on('queueError', (error) => {
        console.error('Queue error:', error);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionStatus('error');
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('queueUpdate');
        socket.off('queueError');
        socket.off('connect_error');
        socket.disconnect();
      };
    } catch (err) {
      console.error('Socket.IO initialization error:', err);
    }
  }, [selectedDept]);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-brand-teal mb-8 flex items-center tracking-normaler">
        <Activity className="mr-3 h-10 w-10 text-brand-teal animate-pulse" /> {t.RRDCH_LIVE_QUEUE}
      </h1>

      <div className="flex space-x-2 mb-10 overflow-x-auto w-full max-w-2xl pb-2">
        {departments.map(dept => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedDept === dept.id ? 'bg-brand-teal text-white shadow-[0_0_15px_rgba(45,212,191,0.5)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {language === 'KN' ? deptMap[dept.name] || dept.name : dept.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-gray-900 border-t-8 border-brand-teal rounded-3xl p-10 text-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">{t.NOW_SERVING}</div>
          <div className="text-9xl font-bold text-white mb-2">{liveData.currentToken || "---"}</div>
          <div className="text-brand-teal text-xs font-bold animate-pulse">{t.LIVE_STATUS}</div>
        </div>

        <div className="bg-gray-900 border-t-8 border-brand-blue rounded-3xl p-10 text-center shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div>
            <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">{t.ESTIMATED_WAIT}</div>
            <div className="text-6xl font-bold text-white">{liveData.waitingCount * 10} <span className="text-2xl text-gray-400">{t.MINS}</span></div>
            <div className="text-gray-400 text-xs mt-2 italic">{liveData.waitingCount} {t.PATIENTS_AHEAD}</div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800">
             <div className="flex items-center justify-center text-gray-300 space-x-2">
               <Users className="h-5 w-5" />
               <span className="text-sm font-medium">{t.DEPARTMENT}: {language === 'KN' ? deptMap[departments.find(d => d.id === selectedDept)?.name] || departments.find(d => d.id === selectedDept)?.name : departments.find(d => d.id === selectedDept)?.name}</span>
             </div>
             <div className="mt-3 text-xs font-bold text-gray-400">
               Connection: <span className={connectionStatus === 'connected' ? 'text-green-400' : connectionStatus === 'disconnected' ? 'text-amber-400' : 'text-red-400'}>
                 {connectionStatus === 'connected' ? '🟢 Live' : connectionStatus === 'disconnected' ? '🟡 Polling' : '🔴 Error'}
               </span>
             </div>
          </div>
        </div>
      </div>

      <p className="mt-12 text-gray-400 text-sm flex items-center">
        <Clock className="mr-2 h-4 w-4" /> {connectionStatus === 'connected' ? 'Real-time updates' : t.UPDATED_EVERY_15}
      </p>
    </div>
  );
};

export default LiveQueueView;
