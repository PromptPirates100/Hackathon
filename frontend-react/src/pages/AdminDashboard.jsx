// src/pages/AdminDashboard.jsx
import MetricsCards from '../components/MetricsCards';
import QueueTable from '../components/QueueTable';
import AlertPanel from '../components/AlertPanel';
import HospitalMap from '../components/HospitalMap';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function Sparkline({ id, data, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels: data.map((_,i)=>i), datasets: [{ data, borderColor: color, fill: false, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
      options: { animation: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
    return () => chart.destroy();
  }, []);
  return <canvas ref={ref} width={80} height={28}></canvas>;
}

function AnalyticsSection() {
  const sevRef = useRef(null), trendRef = useRef(null), utilRef = useRef(null);
  useEffect(() => {
    const charts = [];
    if (sevRef.current) charts.push(new Chart(sevRef.current.getContext('2d'), {
      type: 'doughnut',
      data: { labels:['Red','Yellow','Blue'], datasets:[{ data:[18,22,12], backgroundColor:['#dc2626','#d97706','#2563eb'], borderWidth:2, borderColor:'#fff' }] },
      options: { cutout:'65%', plugins:{ legend:{ display:true, position:'bottom', labels:{ font:{ size:10 } } } } }
    }));
    if (trendRef.current) charts.push(new Chart(trendRef.current.getContext('2d'), {
      type: 'line',
      data: { labels:['08:00','10:00','12:00','14:00','16:00'], datasets:[
        { data:[20,35,45,60,52], borderColor:'#dc2626', fill:false, tension:0.4, pointRadius:2 },
        { data:[30,28,32,40,38], borderColor:'#2563eb', fill:false, tension:0.4, pointRadius:2 }
      ]},
      options: { plugins:{ legend:{display:false} }, scales:{ x:{grid:{display:false}}, y:{beginAtZero:true,max:100} } }
    }));
    if (utilRef.current) charts.push(new Chart(utilRef.current.getContext('2d'), {
      type: 'bar',
      data: { labels:['CTC','Metro','EUA','SMM','NGH'], datasets:[{ data:[88,62,100,35,40], backgroundColor:['#dc2626','#ea580c','#991b1b','#16a34a','#16a34a'], borderRadius:3 }] },
      options: { plugins:{ legend:{display:false} }, scales:{ y:{beginAtZero:true,max:100} } }
    }));
    return () => charts.forEach(c => c.destroy());
  }, []);

  return (
    <div className="panel">
      <h2>Analytics Section</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        <div><h4 style={{fontSize:12,color:'#6b7280',marginBottom:8}}>Severity distribution</h4><canvas ref={sevRef} height={160}></canvas></div>
        <div><h4 style={{fontSize:12,color:'#6b7280',marginBottom:8}}>Emergency trends</h4><canvas ref={trendRef} height={160}></canvas></div>
        <div><h4 style={{fontSize:12,color:'#6b7280',marginBottom:8}}>Hospital utilization</h4><canvas ref={utilRef} height={160}></canvas></div>
      </div>
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
          <div className="panel">
            <h2>AI Operational Insights</h2>
            <ul className="ai-list">
              <li>Emergency load increased by 32% <span className="ai-tag">(AI analysis)</span></li>
              <li>Cardiac emergencies trending upward <span className="ai-tag">(AI analysis)</span></li>
              <li>Respiratory instability spike detected <span className="ai-tag">(AI analysis)</span></li>
              <li>ICU capacity nearing critical threshold <span className="ai-tag">(AI analysis)</span></li>
              <li>Pre-position 2 ALS units south <span className="ai-tag">(AI suggestion)</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
