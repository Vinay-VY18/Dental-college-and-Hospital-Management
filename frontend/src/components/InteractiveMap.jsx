import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

const InteractiveMap = ({ title = 'Location', address = 'Rajarajeswari Dental College and Hospital' }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  // College Location Coordinates (Rajarajeswari Dental College, Bangalore)
  const collegeLocation = {
    lat: 12.9352,
    lng: 77.6245,
    name: 'Rajarajeswari Dental College and Hospital'
  };

  // Custom marker icons
  const collegeIcon = L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"%3E%3Cpath d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/%3E%3Ccircle cx="12" cy="10" r="3" fill="white"/%3E%3C/svg%3E',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'collegeMarker',
    html: '<div style="background: #0ea5e9; border: 3px solid white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" style="width: 24px; height: 24px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg></div>'
  });

  const userIcon = L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"%3E%3Ccircle cx="12" cy="12" r="8"/%3E%3Ccircle cx="12" cy="12" r="3" fill="white"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([collegeLocation.lat, collegeLocation.lng], 15);

    // Add OpenStreetMap tiles (no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add college marker
    const collegeMarker = L.circleMarker([collegeLocation.lat, collegeLocation.lng], {
      radius: 12,
      fillColor: '#0ea5e9',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map.current);

    collegeMarker.bindPopup(`
      <div style="font-family: Arial, sans-serif; white-space: nowrap;">
        <strong style="color: #0369a1; font-size: 14px;">🏥 ${collegeLocation.name}</strong><br>
        <span style="font-size: 12px; color: #666;">Kumbalgodu, Bangalore</span><br>
        <a href="https://maps.google.com/?q=${collegeLocation.lat},${collegeLocation.lng}" target="_blank" style="font-size: 11px; color: #0ea5e9; text-decoration: none;">Open in Google Maps →</a>
      </div>
    `, { maxWidth: 250 });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });

          // Add user location marker
          const userMarker = L.circleMarker([userLat, userLng], {
            radius: 8,
            fillColor: '#4f46e5',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map.current);

          userMarker.bindPopup('📍 Your Location');

          // Calculate distance
          const R = 6371; // Earth's radius in km
          const dLat = (collegeLocation.lat - userLat) * Math.PI / 180;
          const dLng = (collegeLocation.lng - userLng) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(collegeLocation.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * c;
          setDistance(dist.toFixed(1));

          // Draw line between user and college
          const line = L.polyline([[userLat, userLng], [collegeLocation.lat, collegeLocation.lng]], {
            color: '#0ea5e9',
            weight: 2,
            opacity: 0.5,
            dashArray: '5, 5'
          }).addTo(map.current);

          // Fit both markers in view
          const group = L.featureGroup([userMarker, collegeMarker]);
          map.current.fitBounds(group.getBounds(), { padding: [50, 50] });

          collegeMarker.openPopup();
        },
        (error) => {
          console.log('Geolocation permission denied, showing college location only');
          // Show college location by default
          map.current.setView([collegeLocation.lat, collegeLocation.lng], 15);
          collegeMarker.openPopup();
        }
      );
    } else {
      map.current.setView([collegeLocation.lat, collegeLocation.lng], 15);
      collegeMarker.openPopup();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-brand-teal to-brand-blue text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-2">
                <MapPin className="w-6 h-6" /> {title}
              </h3>
              <p className="text-sm opacity-90 mt-1">{address}</p>
            </div>
          </div>
        </div>
        
        <div className="relative w-full bg-gray-100 rounded-b-2xl overflow-hidden">
          <div 
            ref={mapContainer} 
            className="w-full" 
            style={{ 
              minHeight: '400px',
              height: '500px',
              position: 'relative',
              zIndex: 10 
            }} 
          />
          
          {userLocation && distance && (
            <div className="absolute top-6 right-6 bg-white rounded-lg shadow-2xl p-5 z-40 border-2 border-brand-teal">
              <div className="flex items-center gap-2 text-brand-teal font-bold mb-3">
                <Navigation className="w-5 h-5" />
                <span>Distance</span>
              </div>
              <div className="text-3xl font-black text-brand-teal">{distance} km</div>
              <p className="text-xs text-gray-600 mt-2">from your location</p>
            </div>
          )}

          <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-2xl p-4 z-40 border-2 border-brand-blue text-sm max-w-xs">
            <p className="font-bold text-gray-800 mb-2">📍 Rajarajeswari Dental College</p>
            <p className="text-gray-600 text-xs mb-3">Kumbalgodu, Bangalore 560074</p>
            <a 
              href="https://maps.google.com/?q=12.9352,77.6245" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-teal font-semibold text-xs hover:underline block hover:text-brand-blue transition-colors"
            >
              Get Directions →
            </a>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-teal rounded-full flex items-center justify-center text-white text-sm">🏥</div>
              <div>
                <p className="font-bold text-gray-800">College/Hospital</p>
                <p className="text-xs text-gray-600">Kumbalgodu Campus</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm">📍</div>
              <div>
                <p className="font-bold text-gray-800">Your Location</p>
                <p className="text-xs text-gray-600">Real-time positioning</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            ℹ️ Map uses OpenStreetMap data (free, no API key required). Enable location access for distance calculation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
