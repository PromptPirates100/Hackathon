// src/components/TriageCard.jsx
export default function TriageCard({ result, visible }) {
  if (!visible) return null;
  const r = result || { priority: 'RED', severity: 'CRITICAL', riskScore: '98%' };
  return (
    <div className="panel">
      <h2>Results Panel</h2>
      <div className="section-label">TRIAGE RESULT</div>
      <div className="triage-result-card">
        <div className="triage-line">Priority: <strong>{r.priority}</strong></div>
        <div className="triage-line">Severity: <strong>{r.severity}</strong></div>
        <div className="triage-line">Risk Score: <strong>{r.riskScore}</strong></div>
      </div>
      <div className="section-label">QUICK PRECAUTIONS</div>
      <div className="precautions">
        <ul>
          <li>Immediate oxygen stabilization required</li>
          <li>Prepare trauma response team</li>
          <li>Monitor respiratory instability</li>
        </ul>
      </div>
    </div>
  );
}
