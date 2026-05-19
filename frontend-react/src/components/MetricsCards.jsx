// src/components/MetricsCards.jsx
export default function MetricsCards({ metrics }) {
  const cards = metrics || [
    { label: 'Active Emergencies', value: 52, cls: '' },
    { label: 'High Risk Cases', value: 18, cls: 'red' },
    { label: 'Critical Alerts', value: 3, cls: 'red' },
    { label: 'Avg Response Time', value: '11 min', cls: '' },
    { label: 'Hospital Load %', value: '76%', cls: 'orange' },
    { label: 'Available Beds', value: 24, cls: 'green' },
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
