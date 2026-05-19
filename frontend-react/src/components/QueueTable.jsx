// src/components/QueueTable.jsx
import { useState } from 'react';
import { useEmergencyStore } from '../context/EmergencyStore';

const SEV_COLOR = { critical:'#dc2626', high:'#ea580c', moderate:'#d97706', low:'#16a34a' };
const SEV_LABEL = { critical:'CRITICAL', high:'HIGH', moderate:'MODERATE', low:'LOW' };

function ReportModal({ patient, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-type-icon">📋</span>
            <div>
              <h2>Patient Report — {patient.id}</h2>
              <p>{patient.name} · {patient.date} {patient.time}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Severity badge */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16,
            background: SEV_COLOR[patient.severity] + '18',
            border: `1px solid ${SEV_COLOR[patient.severity]}44`,
            borderRadius:10, padding:'10px 14px' }}>
            <span style={{ width:12, height:12, borderRadius:'50%', background: SEV_COLOR[patient.severity], display:'inline-block' }}></span>
            <strong style={{ color: SEV_COLOR[patient.severity], fontSize:13 }}>
              {SEV_LABEL[patient.severity]} PRIORITY
            </strong>
          </div>

          {/* Patient info grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {[
              ['Name',     patient.name],
              ['Age',      patient.age],
              ['Gender',   patient.gender],
              ['Incident', patient.incident],
              ['Location', patient.location],
              ['Contact',  patient.contact || '—'],
            ].map(([k,v]) => (
              <div key={k} style={{ background:'#f9fafb', borderRadius:8, padding:'9px 12px', border:'1px solid #e5e7eb' }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#9ca3af', marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:13, fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Vitals */}
          <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#6b7280', marginBottom:8 }}>Vitals</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
            {[['BP', patient.bp],['O₂', patient.o2 ? patient.o2+'%' : '—'],['HR', patient.hr ? patient.hr+' bpm' : '—'],['Temp', patient.temp ? patient.temp+'°C' : '—']].map(([k,v]) => (
              <div key={k} style={{ background:'#f9fafb', borderRadius:8, padding:'8px', textAlign:'center', border:'1px solid #e5e7eb' }}>
                <div style={{ fontSize:10, color:'#9ca3af', fontWeight:700 }}>{k}</div>
                <div style={{ fontSize:13, fontWeight:700, marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Symptoms */}
          {patient.symptoms && (
            <>
              <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#6b7280', marginBottom:6 }}>Symptoms</div>
              <div style={{ fontSize:13, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, padding:'10px 12px', marginBottom:14, lineHeight:1.6 }}>{patient.symptoms}</div>
            </>
          )}

          {/* Assigned hospital */}
          <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'10px 14px', fontSize:13 }}>
            🏥 <strong>Assigned Hospital:</strong> {patient.assignedHospId === 'RH01' ? 'District General Hospital Ratnagiri' : patient.assignedHospId === 'RH02' ? 'Civil Hospital Ratnagiri' : 'Tilak Ayurvedic Hospital'}
          </div>

          <div className="modal-actions" style={{ marginTop:16 }}>
            <button className="modal-btn primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QueueTable() {
  const { patients } = useEmergencyStore();
  const [reportPatient, setReportPatient] = useState(null);

  return (
    <div className="panel">
      {reportPatient && <ReportModal patient={reportPatient} onClose={() => setReportPatient(null)} />}
      <div className="panel-header">
        <h2>Live Priority Queue</h2>
        <span style={{ fontSize:12, color:'#9ca3af' }}>{patients.length} patient{patients.length !== 1 ? 's' : ''} registered</span>
      </div>

      {patients.length === 0 ? (
        <div style={{ textAlign:'center', padding:'32px 0', color:'#9ca3af', fontSize:13 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🏥</div>
          No patients registered yet. Staff will appear here once intake is submitted.
        </div>
      ) : (
        <div className="queue-table-wrap">
          <table className="queue-table">
            <thead>
              <tr style={{ background:'#f9fafb' }}>
                <th style={{ padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#6b7280', textAlign:'left' }}>Priority</th>
                <th style={{ padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#6b7280', textAlign:'left' }}>Incident</th>
                <th style={{ padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#6b7280', textAlign:'left' }}>Patient ID</th>
                <th style={{ padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#6b7280', textAlign:'left' }}>Time</th>
                <th style={{ padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#6b7280', textAlign:'left' }}>Report</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} style={{ borderLeft: `4px solid ${SEV_COLOR[p.severity]}` }}>
                  <td style={{ padding:'9px 12px' }}>
                    <span style={{
                      fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:4,
                      background: SEV_COLOR[p.severity] + '20',
                      color: SEV_COLOR[p.severity], letterSpacing:'0.4px'
                    }}>{SEV_LABEL[p.severity]}</span>
                  </td>
                  <td style={{ padding:'9px 12px', fontWeight:600, fontSize:13 }}>{p.incident || p.name}</td>
                  <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:12, color:'#6b7280' }}>{p.id}</td>
                  <td style={{ padding:'9px 12px', fontSize:12, color:'#6b7280' }}>{p.time}</td>
                  <td style={{ padding:'9px 12px' }}>
                    <button
                      onClick={() => setReportPatient(p)}
                      style={{
                        padding:'5px 12px', fontSize:12, fontWeight:600,
                        background:'#f3f4f6', border:'1px solid #e5e7eb',
                        borderRadius:6, cursor:'pointer', transition:'all 0.15s',
                        color:'#374151'
                      }}
                      onMouseEnter={e => e.target.style.background='#2563eb' && (e.target.style.color='#fff')}
                      onMouseLeave={e => { e.target.style.background='#f3f4f6'; e.target.style.color='#374151'; }}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
