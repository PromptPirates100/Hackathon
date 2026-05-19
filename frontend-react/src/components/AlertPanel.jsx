// src/components/AlertPanel.jsx
import { useEmergencyStore } from '../context/EmergencyStore';

export default function AlertPanel() {
  const { patients } = useEmergencyStore();
  const critical = patients.filter(p => p.severity === 'critical');
  const high     = patients.filter(p => p.severity === 'high');

  if (patients.length === 0) {
    return (
      <div className="panel">
        <h2>Critical Alert Center</h2>
        <div style={{ fontSize:13, color:'#9ca3af', padding:'8px 0' }}>No active alerts. Alerts appear when critical or high-priority patients are registered.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Critical Alert Center</h2>
        <span style={{ fontSize:12, color:'#dc2626', fontWeight:700 }}>{critical.length + high.length} active</span>
      </div>
      <div className="alert-tags">
        {critical.map(p => (
          <span key={p.id} className="alert-tag red">⚠ {p.incident} — {p.name} ({p.id})</span>
        ))}
        {high.map(p => (
          <span key={p.id} className="alert-tag orange">⚠ {p.incident} — {p.name} ({p.id})</span>
        ))}
        {critical.length === 0 && high.length === 0 && (
          <span style={{ fontSize:13, color:'#16a34a' }}>✓ No critical or high-risk patients at this time</span>
        )}
      </div>
    </div>
  );
}
