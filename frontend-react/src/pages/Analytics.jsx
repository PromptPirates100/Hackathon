// src/pages/Analytics.jsx
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const hours = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];

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

  useEffect(() => {
    const charts = [];

    charts.push(new Chart(trendsRef.current.getContext('2d'), {
      type: 'line',
      data: { labels: hours, datasets: [
        { label:'Critical', data:[5,8,14,20,18,22,17,12,8], borderColor:'#dc2626', backgroundColor:'rgba(220,38,38,0.08)', fill:true, tension:0.4, pointRadius:4 },
        { label:'High',     data:[8,12,18,25,22,28,20,15,10], borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,0.08)', fill:true, tension:0.4, pointRadius:4 },
        { label:'Moderate', data:[10,14,20,28,25,30,22,18,12], borderColor:'#d97706', backgroundColor:'rgba(217,119,6,0.06)', fill:true, tension:0.4, pointRadius:4 }
      ]},
      options: { plugins:{ legend:{ display:true, position:'top' } }, scales:{ y:{ beginAtZero:true }, x:{ grid:{ display:false } } } }
    }));

    charts.push(new Chart(sevRef.current.getContext('2d'), {
      type: 'doughnut',
      data: { labels:['Critical','High','Moderate','Low'], datasets:[{ data:[18,22,28,12], backgroundColor:['#dc2626','#ea580c','#d97706','#2563eb'], borderWidth:2, borderColor:'#fff' }] },
      options: { cutout:'60%', plugins:{ legend:{ display:true, position:'bottom' } } }
    }));

    charts.push(new Chart(utilRef.current.getContext('2d'), {
      type: 'bar',
      data: { labels:['City Trauma','Metro','Emerg. A','St. Marys','North Gen','Riverside'], datasets:[{ label:'Utilization %', data:[88,62,100,35,40,70], backgroundColor:['#dc2626','#ea580c','#991b1b','#16a34a','#16a34a','#ea580c'], borderRadius:5 }] },
      options: { plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback: v => v+'%' } } } }
    }));

    charts.push(new Chart(respRef.current.getContext('2d'), {
      type: 'bar',
      data: { labels:['Morning','Afternoon','Evening','Night'], datasets:[{ label:'Avg Response (min)', data:[9.2,11.4,13.1,8.7], backgroundColor:'#2563eb', borderRadius:5 }] },
      options: { plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
    }));

    charts.push(new Chart(incRef.current.getContext('2d'), {
      type: 'doughnut',
      data: { labels:['Traffic','Cardiac','Respiratory','Trauma','Other'], datasets:[{ data:[24,18,12,15,11], backgroundColor:['#2563eb','#dc2626','#d97706','#ea580c','#9ca3af'], borderWidth:2, borderColor:'#fff' }] },
      options: { cutout:'55%', plugins:{ legend:{ display:true, position:'bottom' } } }
    }));

    return () => charts.forEach(c => c.destroy());
  }, []);

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
        <ChartPanel title="Hospital Utilization">
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
