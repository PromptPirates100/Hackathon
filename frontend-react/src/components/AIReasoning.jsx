// src/components/AIReasoning.jsx
export default function AIReasoning({ visible, data }) {
  if (!visible) return null;
  const d = data || {
    reasoning: ['Low oxygen detected', 'Advanced age risk factor', 'Chest pain indicates cardiac emergency'],
    hospital: 'City Trauma Center',
    distance: '35 km',
    eta: '27 min',
    urgency: 'Urgency: This surpasses the recommended route.',
  };
  return (
    <div className="panel">
      <h2>Results Panel</h2>
      <div className="reasoning-grid">
        <div className="reasoning-col">
          <h3>AI REASONING</h3>
          <ul className="reasoning-list">
            {d.reasoning.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        <div className="reasoning-col">
          <h3>LOGISTICS RECOMMENDATION</h3>
          <p className="logistics-item"><strong>{d.hospital}</strong></p>
          <p className="logistics-item">Distance: {d.distance}</p>
          <p className="logistics-item">ETA: {d.eta}</p>
          <p className="logistics-item urgency">{d.urgency}</p>
        </div>
        <div className="reasoning-col">
          <h3>Map View</h3>
          <div className="map-box"></div>
        </div>
      </div>
    </div>
  );
}
