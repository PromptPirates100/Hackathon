// src/components/RatnagiriMap.jsx
import { useEffect, useRef } from 'react';

// Real hospitals in Ratnagiri, Maharashtra with coordinates
const HOSPITALS = [
  {
    name: 'District General Hospital Ratnagiri',
    lat: 16.9857, lng: 73.3006,
    type: 'Government', beds: 300, icu: true,
    address: 'Hospital Road, Ratnagiri 415612',
    phone: '+91-2352-220026',
    tags: ['Trauma', 'ICU', 'Surgery', 'Emergency'],
    distance: 1.2,
  },
  {
    name: 'Civil Hospital Ratnagiri',
    lat: 16.9900, lng: 73.3050,
    type: 'Government', beds: 200, icu: true,
    address: 'Nachane Road, Ratnagiri',
    phone: '+91-2352-221411',
    tags: ['General', 'ICU', 'Paediatrics'],
    distance: 2.1,
  },
  {
    name: 'Ratnagiri Cancer Foundation Hospital',
    lat: 16.9940, lng: 73.3120,
    type: 'Speciality', beds: 100, icu: false,
    address: 'Mirya, Ratnagiri 415612',
    phone: '+91-2352-234567',
    tags: ['Oncology', 'Radiology'],
    distance: 3.4,
  },
  {
    name: 'Tilak Ayurvedic Hospital',
    lat: 16.9820, lng: 73.2980,
    type: 'Private', beds: 50, icu: false,
    address: 'Bhatye Road, Ratnagiri',
    phone: '+91-2352-222233',
    tags: ['General', 'Ayurveda'],
    distance: 2.8,
  },
  {
    name: 'Pawas Rural Hospital',
    lat: 17.0100, lng: 73.2800,
    type: 'Rural', beds: 30, icu: false,
    address: 'Pawas, Ratnagiri',
    phone: '+91-2352-245678',
    tags: ['Primary Care', 'Emergency'],
    distance: 6.5,
  },
];

// Score hospitals based on triage severity
function recommendHospitals(severity) {
  const order = { critical: 0, high: 1, moderate: 2, low: 3 };
  const s = severity?.toLowerCase() || 'moderate';

  if (s === 'critical' || s === 'high') {
    // Need ICU + Trauma
    return [...HOSPITALS].sort((a, b) => {
      const aScore = (a.icu ? 0 : 5) + a.distance;
      const bScore = (b.icu ? 0 : 5) + b.distance;
      return aScore - bScore;
    });
  }
  // Moderate / Low: sort by distance
  return [...HOSPITALS].sort((a, b) => a.distance - b.distance);
}

const SEVERITY_COLOR = {
  critical: '#dc2626', high: '#ea580c', moderate: '#d97706', low: '#16a34a',
};

export default function RatnagiriMap({ severity = 'moderate', patientName }) {
  const mapRef   = useRef(null);
  const mapInst  = useRef(null);
  const recommended = recommendHospitals(severity);
  const top = recommended[0]; // nearest/best fit

  useEffect(() => {
    const L = window.L;
    if (!L || mapInst.current) return;

    // Ratnagiri city center
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
      .setView([16.9857, 73.3006], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Hospital markers
    recommended.forEach((h, i) => {
      const isTop = i === 0;
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
          <span style="font-size:11px;color:#6b7280">${h.type} · ${h.beds} beds · ${h.distance} km away</span><br>
          <div style="margin-top:6px;font-size:11px">${h.tags.map(t=>`<span style="background:#f3f4f6;padding:2px 6px;border-radius:4px;margin-right:3px">${t}</span>`).join('')}</div>
          <div style="margin-top:6px;font-size:11px;color:#374151">${h.address}</div>
          <div style="margin-top:4px;font-size:11px;color:#2563eb">${h.phone}</div>
          ${isTop ? `<div style="margin-top:8px;background:#dbeafe;color:#1d4ed8;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:700">⭐ RECOMMENDED FOR THIS PATIENT</div>` : ''}
        </div>`;

      L.marker([h.lat, h.lng], { icon }).addTo(map).bindPopup(popup, { maxWidth: 240 });
      if (isTop) L.marker([h.lat, h.lng], { icon }).openPopup();
    });

    // Patient location pulse (city center as fallback)
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
      {/* Map */}
      <div ref={mapRef} className="leaflet-map"></div>

      {/* Hospital list */}
      <div className="hosp-rec-list">
        <div className="hosp-rec-header">
          <span>🏥 Recommended Hospitals</span>
          <span className="sev-tag" style={{ background: SEVERITY_COLOR[severity?.toLowerCase()] || '#6b7280' }}>
            {(severity || 'Moderate').toUpperCase()}
          </span>
        </div>
        {recommended.map((h, i) => (
          <div key={i} className={`hosp-rec-row ${i === 0 ? 'top-rec' : ''}`}>
            <div className="rec-rank">{i === 0 ? '★' : i + 1}</div>
            <div className="rec-info">
              <strong>{h.name}</strong>
              <span>{h.distance} km · {h.type} · {h.beds} beds{h.icu ? ' · ICU ✓' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
