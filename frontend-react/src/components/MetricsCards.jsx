// src/components/MetricsCards.jsx
import { useEmergencyStore } from '../context/EmergencyStore';

export default function MetricsCards() {
  const { metrics } = useEmergencyStore();
  const { active, highRisk, criticalAlerts, loadPct, availBeds } = metrics;

  const loadCls = loadPct >= 80 ? 'red' : loadPct >= 50 ? 'orange' : 'green';

  const cards = [
    { label: 'Active Emergencies', value: active,                     cls: active > 0 ? '' : '' },
    { label: 'High Risk Cases',    value: highRisk,                   cls: highRisk > 0 ? 'red' : '' },
    { label: 'Critical Alerts',    value: criticalAlerts,             cls: criticalAlerts > 0 ? 'red' : '' },
    { label: 'Avg Response Time',  value: active > 0 ? `${Math.max(8, 20 - active)} min` : '— min', cls: '' },
    { label: 'Hospital Load %',    value: `${loadPct}%`,             cls: loadCls },
    { label: 'Available Beds',     value: availBeds,                  cls: availBeds < 20 ? 'red' : 'green' },
  ];

  return (
    <div className="metrics-row">
      {cards.map((c, i) => (
        <div className="metric-card" key={i}>
          <div className="metric-label">{c.label}</div>
          <div className={`metric-num ${c.cls}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
