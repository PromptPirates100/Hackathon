// src/components/AlertPanel.jsx
export default function AlertPanel({ alerts }) {
  const items = alerts || [
    { label: 'Multi-trauma escalation', level: 'red' },
    { label: 'ICU capacity critical', level: 'red' },
    { label: 'High-risk patient detected', level: 'orange' },
  ];
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Critical Alert Center</h2>
        <span style={{color:'#9ca3af', cursor:'pointer', fontSize:18}}>⋮</span>
      </div>
      <div className="alert-tags">
        {items.map((a, i) => (
          <span key={i} className={`alert-tag ${a.level}`}>⚠ {a.label}</span>
        ))}
      </div>
    </div>
  );
}
