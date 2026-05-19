// src/pages/AdminDashboard.jsx
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import MetricsCards from '../components/MetricsCards';
import QueueTable   from '../components/QueueTable';
import AlertPanel   from '../components/AlertPanel';
import HospitalMap  from '../components/HospitalMap';
import { useEmergencyStore } from '../context/EmergencyStore';

Chart.register(...registerables);
Chart.defaults.font.family = 'Inter';
Chart.defaults.font.size   = 11;
Chart.defaults.color       = '#6b7280';

function AnalyticsSection() {
  const { patients } = useEmergencyStore();

  const sevRef  = useRef(null);
  const typeRef = useRef(null);
  const sevChart  = useRef(null);
  const typeChart = useRef(null);

  useEffect(() => {
    // Severity donut
    const sevCounts = {
      Critical: patients.filter(p => p.severity === 'critical').length,
      High:     patients.filter(p => p.severity === 'high').length,
      Moderate: patients.filter(p => p.severity === 'moderate').length,
      Low:      patients.filter(p => p.severity === 'low').length,
    };

    // Incident types count
    const typeMap = {};
    patients.forEach(p => {
      const t = p.incident || 'Other';
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    const typeLabels = Object.keys(typeMap);
    const typeData   = Object.values(typeMap);

    // Destroy old charts
    sevChart.current?.destroy();
    typeChart.current?.destroy();

    if (sevRef.current) {
      sevChart.current = new Chart(sevRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Critical','High','Moderate','Low'],
          datasets: [{ data: [sevCounts.Critical, sevCounts.High, sevCounts.Moderate, sevCounts.Low],
            backgroundColor:['#dc2626','#ea580c','#d97706','#16a34a'], borderWidth:2, borderColor:'#fff' }]
        },
        options: { cutout:'65%', plugins:{ legend:{ display:true, position:'bottom' } } }
      });
    }

    if (typeRef.current && typeLabels.length > 0) {
      typeChart.current = new Chart(typeRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: typeLabels,
          datasets: [{ data: typeData, backgroundColor:'#2563eb', borderRadius:5 }]
        },
        options: {
          indexAxis: 'y',
          plugins:{ legend:{ display:false } },
          scales:{ x:{ beginAtZero:true, ticks:{ stepSize:1 } }, y:{ grid:{ display:false } } }
        }
      });
    }

    return () => { sevChart.current?.destroy(); typeChart.current?.destroy(); };
  }, [patients]);

  if (patients.length === 0) {
    return (
      <div className="panel">
        <h2>Analytics Section</h2>
        <div style={{ textAlign:'center', padding:'32px 0', color:'#9ca3af', fontSize:13 }}>
          <div style={{ fontSize:28, marginBottom:8 }}>📊</div>
          Analytics will populate once staff submit patient intake records.
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Analytics Section — Live Patient Data</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div>
          <h4 style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>Severity Distribution ({patients.length} patients)</h4>
          <canvas ref={sevRef} height={200}></canvas>
        </div>
        <div>
          <h4 style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>Cases by Incident Type</h4>
          {patients.length > 0
            ? <canvas ref={typeRef} height={200}></canvas>
            : <div style={{ color:'#9ca3af', fontSize:13 }}>No data yet</div>
          }
        </div>
      </div>
    </div>
  );
}

function AIInsightsPanel() {
  const { patients, metrics } = useEmergencyStore();
  const insights = [];
  if (patients.length === 0) insights.push('No active emergencies — system standing by.');
  if (metrics.criticalAlerts > 0) insights.push(`⚠ ${metrics.criticalAlerts} critical patient(s) require immediate attention.`);
  if (metrics.highRisk > 3)       insights.push(`Emergency load elevated — ${metrics.highRisk} high-risk cases active.`);
  if (metrics.loadPct >= 70)      insights.push(`⚠ Hospital capacity at ${metrics.loadPct}% — consider diversifying to Civil Hospital.`);
  if (metrics.availBeds < 20)     insights.push(`⚠ Available beds critically low: ${metrics.availBeds} remaining.`);
  if (patients.length > 0)        insights.push(`${patients.length} total patient(s) registered. Queue sorted by severity.`);
  const cardiac = patients.filter(p => p.incident?.toLowerCase().includes('cardiac')).length;
  if (cardiac > 0)                insights.push(`${cardiac} cardiac case(s) active — notify cardiology team.`);

  return (
    <div className="panel">
      <h2>AI Operational Insights</h2>
      <ul className="ai-list">
        {insights.map((ins, i) => (
          <li key={i} className={ins.startsWith('⚠') ? 'finding-warning-inline' : ''}>{ins}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="page-content">
      <MetricsCards />
      <div className="admin-grid">
        <div className="admin-col">
          <QueueTable />
          <AlertPanel />
          <AnalyticsSection />
        </div>
        <div className="admin-col">
          <HospitalMap />
          <AIInsightsPanel />
        </div>
      </div>
    </div>
  );
}
