import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Bell, X, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState(null); // High-priority modal alert
  const socketRef = useRef(null);

  const addNotification = (title, message, type = 'info') => {
    const id = Date.now();
    const newNotif = { id, title, message, type };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
    
    // Auto remove after 10 seconds unless it's high priority
    setTimeout(() => {
      removeNotification(id);
    }, 10000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showAlert = (title, message) => {
    setAlert({ title, message });
  };

  useEffect(() => {
    // Initialize Socket.IO
    socketRef.current = io('http://localhost:5000');
    const socket = socketRef.current;

    socket.on('queueUpdate', (data) => {
      // Logic for patient-specific alerts
      const profileRaw = sessionStorage.getItem('patientProfile');
      if (!profileRaw) return;

      try {
        const patient = JSON.parse(profileRaw);
        // We logic check if this update is relevant to the current user's appointments
        // This is usually handled in the dashboard, but now we do it globally
        // However, we need to know the patient's token. 
        // For simplicity, we'll listen for a generic event or specific broadcast
      } catch (e) {}
    });

    socket.on('adminBroadcast', (data) => {
      showAlert(data.title || "Hospital Announcement", data.message);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, showAlert, notifications, removeNotification }}>
      {children}
      
      {/* Global High-Priority Alert Modal */}
      {alert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border-4 border-brand-teal text-center transform animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Bell className="w-12 h-12 text-brand-teal animate-bounce" />
              <div className="absolute inset-0 bg-brand-teal rounded-full animate-ping opacity-20"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{alert.title}</h2>
            <p className="text-gray-800 text-lg mb-8 font-medium leading-relaxed">{alert.message}</p>
            <button 
              onClick={() => setAlert(null)} 
              className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold text-xl hover:bg-opacity-90 shadow-xl transition-all active:scale-95"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-3 max-w-sm w-full">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white rounded-2xl p-4 shadow-2xl border-l-4 border-brand-blue flex items-start gap-4 animate-in slide-in-from-right duration-300">
            <div className={`p-2 rounded-xl bg-brand-blue/10`}>
              {n.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <Info className="w-5 h-5 text-brand-blue" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm">{n.title}</h4>
              <p className="text-xs text-gray-800 mt-1">{n.message}</p>
            </div>
            <button onClick={() => removeNotification(n.id)} className="text-gray-800 hover:text-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
