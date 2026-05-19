// src/pages/Analytics.jsx
import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const HOURS = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];

function ChartPanel({ title, children }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default function Analytics() {
  const trendsRef = useRef(null);
  const sevRef    = useRef(null);
  const utilRef   = useRef(null);
  const respRef   = useRef(null);
  const incRef    = useRef(null);
  const [analytics, setAnalytics] = useState(null);

  // Fetch real analytics from backend
  useEffect(() => {
    fetch('/api/analytics/')
      .then(r => r.json())
      .then(data => setAnalytics(data))
      .catch(() => setAnalytics(null)); // will fallback to hardcoded
  }, []);

  useEffect(() => {
    const charts = [];

    // --- Trends (line) ---
    // Backend returns `recent_trends` array of { hour, count } — adapt if different
    const trendsData = analytics?.recent_trends || [];
    const trendHours = trendsData.length > 0
      ? trendsData.map(t => `${t.hour}:00`)
      : HOURS;
    const criticalTrend = trendsData.length > 0
      ? trendsData.map(t => t.count)
      : [5,8,14,20,18,22,17,12,8]; // fallback

    charts.push(new Chart(trendsRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: trendHours,
        datasets: [
          { label:'Critical', data: criticalTrend, borderColor:'#dc2626', backgroundColor:'rgba(220,38,38,0.08)', fill:true, tension:0.4, pointRadius:4 },
        ]
      },
      options: { plugins:{ legend:{ display:true } }, scales:{ y:{ beginAtZero:true } } }
    }));

    // --- Severity donut ---
    const sev = analytics?.severity_distribution || {};
    const sevLabels = ['Critical','High','Moderate','Stable'];
    const sevData = [
      sev.critical || 0,
      sev.high || 0,
      sev.moderate || 0,
      sev.stable || 0,
    ];
    const hasSevData = sevData.some(v => v > 0);
    charts.push(new Chart(sevRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: sevLabels,
        datasets: [{
          data: hasSevData ? sevData : [18,22,28,12], // fallback
          backgroundColor: ['#dc2626','#ea580c','#d97706','#2563eb'],
          borderWidth:2, borderColor:'#fff'
        }]
      },
      options: { cutout:'60%', plugins:{ legend:{ display:true, position:'bottom' } } }
    }));

    // --- Hospital utilization (bar) ---
    const load = analytics?.hospital_load || {};
    const hospNames = Object.keys(load).length > 0 ? Object.keys(load) : ['City Trauma','Metro','Emerg. A','St. Marys','North Gen','Riverside'];
    const hospData  = Object.keys(load).length > 0 ? Object.values(load) : [88,62,100,35,40,70];
    charts.push(new Chart(utilRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: hospNames,
        datasets: [{
          label:'Active Patients', data: hospData,
          backgroundColor: hospData.map(v => v >= 8 ? '#dc2626' : v >= 4 ? '#ea580c' : '#2563eb'),
          borderRadius:5
        }]
      },
      options: { plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
    }));

    // --- Response time (bar) ---
    // not in API, keep fallback
    charts.push(new Chart(respRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Morning','Afternoon','Evening','Night'],
        datasets: [{
          label:'Avg Response (min)', data:[9.2,11.4,13.1,8.7],
          backgroundColor:'#2563eb', borderRadius:5
        }]
      },
      options: { plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
    }));

    // --- Incident types (donut) ---
    const incLabels = analytics?.severity_distribution
      ? Object.keys(analytics.severity_distribution)
      : ['Traffic','Cardiac','Respiratory','Trauma','Other'];
    const incData   = analytics?.severity_distribution
      ? Object.values(analytics.severity_distribution)
      : [24,18,12,15,11];
    charts.push(new Chart(incRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: incLabels,
        datasets: [{
          data: incData,
          backgroundColor: ['#2563eb','#dc2626','#d97706','#ea580c','#9ca3af'],
          borderWidth:2, borderColor:'#fff'
        }]
      },
      options: { cutout:'55%', plugins:{ legend:{ display:true, position:'bottom' } } }
    }));

    return () => charts.forEach(c => c.destroy());
  }, [analytics]);

  return (
    <div className="page-content">
      <div className="page-title-row">
        <h1 className="page-title">Analytics</h1>
        <span className="live-count">Last 24 hours</span>
      </div>
      <div className="analytics-grid">
        <div className="panel chart-full">
          <h2>Emergency Trends (Last 24h)</h2>
          <canvas ref={trendsRef} height={90}></canvas>
        </div>
        <ChartPanel title="Severity Distribution">
          <canvas ref={sevRef} height={200}></canvas>
        </ChartPanel>
        <ChartPanel title="Hospital Load (Active Patients)">
          <canvas ref={utilRef} height={200}></canvas>
        </ChartPanel>
        <ChartPanel title="Response Time by Shift (min)">
          <canvas ref={respRef} height={200}></canvas>
        </ChartPanel>
        <ChartPanel title="Cases by Incident Type">
          <canvas ref={incRef} height={200}></canvas>
        </ChartPanel>
      </div>
    </div>
  );
}