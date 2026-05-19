// src/components/HospitalMap.jsx
export default function HospitalMap({ hospitals }) {
  const list = hospitals || [
    { name: 'City Trauma Center', load: 'HIGH LOAD', bar: 'red', badge: 'red' },
    { name: 'Metro Hospital', load: 'MODERATE', bar: 'orange', badge: 'orange' },
    { name: 'Emergency Unit A', load: 'FULL', bar: 'dark-red', badge: 'dark-red' },
    { name: "St. Mary's Medical", load: 'AVAILABLE', bar: 'green', badge: 'green' },
  ];
  return (
    <div className="panel">
      <h2>Hospital Status Panel</h2>
      <div className="hosp-list">
        {list.map((h, i) => (
          <div className="hosp-row" key={i}>
            <span className={`hosp-bar ${h.bar}`}></span>
            <div className="hosp-info">
              <strong>{h.name}</strong>
              <span className={`hosp-badge ${h.badge}`}>{h.load}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
