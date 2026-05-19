// src/components/HospitalMap.jsx
import { useEmergencyStore } from '../context/EmergencyStore';

function loadPct(h) {
  return h.totalBeds > 0 ? Math.round((h.usedBeds / h.totalBeds) * 100) : 0;
}

function statusOf(pct) {
  if (pct >= 90) return { label:'FULL',      bar:'dark-red', badge:'dark-red' };
  if (pct >= 70) return { label:'HIGH LOAD', bar:'red',      badge:'red' };
  if (pct >= 40) return { label:'MODERATE',  bar:'orange',   badge:'orange' };
  return              { label:'AVAILABLE',  bar:'green',    badge:'green' };
}

export default function HospitalMap() {
  const { hospitals } = useEmergencyStore();

  return (
    <div className="panel">
      <h2>Hospital Status Panel — Ratnagiri</h2>
      <div className="hosp-list">
        {hospitals.map(h => {
          const pct = loadPct(h);
          const st  = statusOf(pct);
          return (
            <div className="hosp-row" key={h.id}>
              <span className={`hosp-bar ${st.bar}`}></span>
              <div className="hosp-info" style={{ flex:1 }}>
                <strong>{h.name}</strong>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3 }}>
                  <span className={`hosp-badge ${st.badge}`}>{st.label}</span>
                  <span style={{ fontSize:11, color:'#9ca3af' }}>{h.usedBeds}/{h.totalBeds} beds · {pct}% load</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
