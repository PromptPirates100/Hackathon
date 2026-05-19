// src/components/AIReasoning.jsx
import RatnagiriMap from './RatnagiriMap';

const SEV_COLOR = { critical:'#dc2626', high:'#ea580c', moderate:'#d97706', low:'#16a34a' };
const SEV_LABEL = { critical:'CRITICAL — RED', high:'HIGH — ORANGE', moderate:'MODERATE — YELLOW', low:'LOW — GREEN' };

export default function AIReasoning({ visible, data }) {
  if (!visible || !data) return null;

  // Real backend triage & logistics
  const triage = data.triageData;
  const logistics = data.logisticsData;

  const reasoningList = triage?.reasoning || [];
  const severity      = triage?.severity || 'moderate';
  const priority      = triage?.priority || '—';
  const riskScore     = triage?.risk_score ?? '—';
  const recommendation = triage?.recommendation || 'Follow clinical protocol.';
  const hospitalName  = logistics?.nearest_hospital || 'Searching...';
  const urgency       = logistics?.urgency || '—';
  const eta           = logistics?.estimated_response || '—';
  const transport     = severity === 'critical' || severity === 'high' ? 'ALS Ambulance' : 'BLS Ambulance';

  // Hospitals for the map – if the backend sent alternatives, use them; otherwise empty
  const mapHospitals = logistics?.alternatives || [];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* ── Triage Result Card ── */}
      <div className="panel">
        <h2>AI Triage Result</h2>
        <div className="triage-result-card" style={{
          background: `linear-gradient(135deg, ${SEV_COLOR[severity]}cc, ${SEV_COLOR[severity]})`
        }}>
          <div className="triage-line">Priority: <strong>{SEV_LABEL[severity]}</strong></div>
          <div className="triage-line" style={{ fontSize:12, opacity:0.85, marginTop:4 }}>
            Patient registered in Admin Dashboard priority queue
          </div>
        </div>

        {/* Clinical Reasoning */}
        <div className="section-label" style={{ marginTop:14 }}>AI CLINICAL REASONING</div>
        <ul className="reasoning-list" style={{ marginBottom:14 }}>
          {reasoningList.map((r, i) => (
            <li key={i} className={r.startsWith('⚠') ? 'finding-warning-inline' : ''}>{r}</li>
          ))}
          {reasoningList.length === 0 && (
            <li style={{ color:'#9ca3af' }}>Awaiting complete analysis...</li>
          )}
        </ul>

        {/* Recommended Actions */}
        <div className="section-label">RECOMMENDED ACTIONS</div>
        <div style={{ background:'#f9fafb', border:'1px solid var(--border)', borderRadius:8, padding:12, marginBottom:14, fontSize:13, lineHeight:1.5 }}>
          {recommendation}
        </div>

        {/* Logistics Grid */}
        <div className="section-label">LOGISTICS</div>
        <div className="logistics-grid">
          <div className="logistics-box">
            <span className="l-icon">🚑</span>
            <div><strong>Transport</strong><span>{transport}</span></div>
          </div>
          <div className="logistics-box">
            <span className="l-icon">⏱</span>
            <div><strong>Est. ETA</strong><span>{eta}</span></div>
          </div>
          <div className="logistics-box">
            <span className="l-icon">📍</span>
            <div><strong>Nearest Hospital</strong><span>{hospitalName}</span></div>
          </div>
        </div>
      </div>

      {/* ── Hospital Map ── */}
      <div className="panel">
        <h2>Hospital Map — Ratnagiri, Maharashtra</h2>
        <p style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>
          ★ Recommended hospital based on severity: <strong>{SEV_LABEL[severity]}</strong>
        </p>
        <RatnagiriMap
          severity={severity}
          patientName={data.name || '—'}
          hospitals={mapHospitals}
          nearestHospital={hospitalName}
        />
      </div>
    </div>
  );
}