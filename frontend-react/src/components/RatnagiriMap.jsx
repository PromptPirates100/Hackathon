// src/components/RatnagiriMap.jsx
import { useEffect, useRef } from 'react';

// Fallback hospitals (used when backend is offline or returns no alternatives)
const DEFAULT_HOSPITALS = [
  { name: 'District General Hospital Ratnagiri', lat: 16.9857, lng: 73.3006, type: 'Government', beds: 300, icu: true, distance: 1.2 },
  { name: 'Civil Hospital Ratnagiri', lat: 16.9900, lng: 73.3050, type: 'Government', beds: 200, icu: true, distance: 2.1 },
  { name: 'Ratnagiri Cancer Foundation Hospital', lat: 16.9940, lng: 73.3120, type: 'Speciality', beds: 100, icu: false, distance: 3.4 },
  { name: 'Tilak Ayurvedic Hospital', lat: 16.9820, lng: 73.2980, type: 'Private', beds: 50, icu: false, distance: 2.8 },
  { name: 'Pawas Rural Hospital', lat: 17.0100, lng: 73.2800, type: 'Rural', beds: 30, icu: false, distance: 6.5 },
];

const SEVERITY_COLOR = {
  critical: '#dc2626', high: '#ea580c', moderate: '#d97706', low: '#16a34a',
};

export default function RatnagiriMap({ severity = 'moderate', patientName, hospitals, nearestHospital }) {
  const mapRef   = useRef(null);
  const mapInst  = useRef(null);

  // Use backend hospitals if available, else fallback
  const hosps = hospitals && hospitals.length > 0
    ? hospitals.map(h => ({
        name: h.name,
        lat: h.lat,
        lng: h.lon,
        distance: h.route_distance_km || h.straight_line_km || h.distance_km || 0,
        type: h.amenity_type || 'Hospital',
        beds: '—',
        icu: false,
        emergency: h.emergency || false,
      }))
    : DEFAULT_HOSPITALS;

  // Mark the nearest hospital as top recommendation
  const topName = nearestHospital || (hosps.length > 0 ? hosps[0].name : '');
  const sorted = [...hosps].sort((a, b) => {
    const aTop = a.name === topName ? -1 : 0;
    const bTop = b.name === topName ? -1 : 0;
    return aTop - bTop || (a.distance || 0) - (b.distance || 0);
  });

  useEffect(() => {
    const L = window.L;
    if (!L || mapInst.current) return;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
      .setView([16.9857, 73.3006], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    sorted.forEach((h, i) => {
      const isTop = h.name === topName;
      const color = isTop ? '#2563eb' : '#6b7280';
      const icon = L.divIcon({
        html: `<div style="
          background:${color};color:#fff;
          width:${isTop ? 34 : 26}px;height:${isTop ? 34 : 26}px;
          border-radius:50%;border:3px solid #fff;
          display:flex;align-items:center;justify-content:center;
          font-size:${isTop ? 16 : 13}px;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
          font-weight:700;
        ">${isTop ? '★' : (i+1)}</div>`,
        className: '', iconSize: [isTop ? 34 : 26, isTop ? 34 : 26], iconAnchor: [isTop ? 17 : 13, isTop ? 17 : 13],
      });

      const popup = `
        <div style="font-family:Inter,sans-serif;min-width:180px">
          <strong style="font-size:13px">${h.name}</strong><br>
          <span style="font-size:11px;color:#6b7280">${h.type} · ${h.distance} km</span><br>
          ${isTop ? `<div style="margin-top:8px;background:#dbeafe;color:#1d4ed8;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:700">⭐ RECOMMENDED</div>` : ''}
        </div>`;

      L.marker([h.lat, h.lng], { icon }).addTo(map).bindPopup(popup, { maxWidth: 240 });
      if (isTop) L.marker([h.lat, h.lng], { icon }).openPopup();
    });

    // Patient location marker (centered at Ratnagiri city)
    const patIcon = L.divIcon({
      html: `<div style="
        background:#ef4444;color:#fff;
        width:18px;height:18px;border-radius:50%;
        border:3px solid #fff;box-shadow:0 0 0 4px rgba(239,68,68,0.3);
        animation:pulse 1.5s infinite;
      "></div>`,
      className: '', iconSize: [18, 18], iconAnchor: [9, 9],
    });
    L.marker([16.9870, 73.3020], { icon: patIcon }).addTo(map)
      .bindPopup(`<strong style="font-size:12px">📍 Patient Location</strong>${patientName ? `<br><span style="font-size:11px">${patientName}</span>` : ''}`);

    mapInst.current = map;
    return () => { if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; } };
  }, []);

  return (
    <div className="ratnagiri-map-wrap">
      <div ref={mapRef} className="leaflet-map"></div>
      <div className="hosp-rec-list">
        <div className="hosp-rec-header">
          <span>🏥 Recommended Hospitals</span>
          <span className="sev-tag" style={{ background: SEVERITY_COLOR[severity] || '#6b7280' }}>
            {(severity || 'Moderate').toUpperCase()}
          </span>
        </div>
        {sorted.map((h, i) => (
          <div key={i} className={`hosp-rec-row ${h.name === topName ? 'top-rec' : ''}`}>
            <div className="rec-rank">{h.name === topName ? '★' : i + 1}</div>
            <div className="rec-info">
              <strong>{h.name}</strong>
              <span>{h.distance} km · {h.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}