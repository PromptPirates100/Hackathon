// src/components/AIReasoning.jsx
import RatnagiriMap from './RatnagiriMap';

const SEV_COLOR = { critical:'#dc2626', high:'#ea580c', moderate:'#d97706', low:'#16a34a' };
const SEV_LABEL = { critical:'CRITICAL — RED', high:'HIGH — ORANGE', moderate:'MODERATE — YELLOW', low:'LOW — GREEN' };

function deriveReasoning(data) {
  // data shape: { form: { name, age, bp, o2, hr, temp, symptoms, incidentType, ... }, uploads }
  const form = data?.form || data || {};
  const reasoning = [];
  let score = 0;

  const o2  = parseFloat(form.o2);
  const hr  = parseFloat(form.hr);
  const age = parseInt(form.age);

  if (!isNaN(o2)) {
    if (o2 < 88)  { reasoning.push('⚠ Critical oxygen level (' + o2 + '%) — hypoxia detected'); score += 3; }
    else if (o2 < 94) { reasoning.push('Low oxygen saturation (' + o2 + '%) — monitor closely'); score += 1; }
    else reasoning.push('Oxygen level within acceptable range (' + o2 + '%)');
  }

  if (!isNaN(hr)) {
    if (hr > 120 || hr < 40) { reasoning.push('⚠ Abnormal heart rate (' + hr + ' bpm) — cardiac monitoring needed'); score += 2; }
    else if (hr > 100) { reasoning.push('Elevated heart rate (' + hr + ' bpm) — tachycardia noted'); score += 1; }
    else reasoning.push('Heart rate within normal range (' + hr + ' bpm)');
  }

  if (!isNaN(age) && age >= 60) { reasoning.push('Advanced age (' + age + ' yrs) — elevated risk factor'); score += 1; }

  const symp = (form.symptoms || '').toLowerCase();
  if (symp.includes('chest pain') || symp.includes('cardiac'))   { reasoning.push('⚠ Chest pain reported — possible cardiac emergency'); score += 3; }
  if (symp.includes('breath') || symp.includes('respiratory'))   { reasoning.push('⚠ Respiratory distress indicated'); score += 2; }
  if (symp.includes('unconsci') || symp.includes('faint'))       { reasoning.push('⚠ Loss of consciousness reported'); score += 3; }
  if (symp.includes('bleed') || symp.includes('hemorrh'))        { reasoning.push('⚠ Active bleeding indicated'); score += 2; }

  if (form.incidentType === 'Traffic Accident') { reasoning.push('Traffic trauma — multi-system injury risk'); score += 1; }
  if (form.incidentType === 'Cardiac Event')    { reasoning.push('⚠ Cardiac event — immediate intervention required'); score += 3; }

  if (reasoning.length === 0) reasoning.push('Standard assessment performed. No critical flags detected.');

  const severity = score >= 6 ? 'critical' : score >= 3 ? 'high' : score >= 1 ? 'moderate' : 'low';
  return { reasoning, severity };
}

export default function AIReasoning({ visible, data }) {
  if (!visible || !data) return null;

  const { reasoning, severity } = deriveReasoning(data);
  const form = data?.form || {};
  const patientName = form.name || '';
  const eta = severity === 'critical' ? '8–12 min' : severity === 'high' ? '15–20 min' : '25–35 min';
  const transport = severity === 'critical' ? 'ALS Ambulance (Critical Care)' : severity === 'high' ? 'BLS Ambulance' : 'Patient Vehicle / BLS';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* Triage Result + Reasoning */}
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

        <div className="section-label" style={{ marginTop:14 }}>AI CLINICAL REASONING</div>
        <ul className="reasoning-list" style={{ marginBottom:14 }}>
          {reasoning.map((r, i) => (
            <li key={i} className={r.startsWith('⚠') ? 'finding-warning-inline' : ''}>{r}</li>
          ))}
        </ul>

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
            <div><strong>Region</strong><span>Ratnagiri, MH</span></div>
          </div>
        </div>
      </div>

      {/* Hospital Map */}
      <div className="panel">
        <h2>Hospital Map — Ratnagiri, Maharashtra</h2>
        <p style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>
          ★ Recommended hospital based on severity: <strong>{SEV_LABEL[severity]}</strong>
        </p>
        <RatnagiriMap severity={severity} patientName={patientName} />
      </div>

    </div>
  );
}
