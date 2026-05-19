// src/components/QueueTable.jsx
import { useState, useEffect } from 'react';

const MOCK_QUEUE = [
  { priority:'critical', dot:'red',    name:'Multi-trauma accident', id:'001', time:'14:02', team:'Team A' },
  { priority:'high',     dot:'orange', name:'Cardiac emergency',     id:'002', time:'14:05', team:'Team B' },
  { priority:'moderate', dot:'yellow', name:'Head injury',           id:'003', time:'14:12', team:'—' },
  { priority:'low',      dot:'yellow', name:'Fever case',            id:'004', time:'14:18', team:'—' },
  { priority:'low',      dot:'green',  name:'Minor laceration',      id:'005', time:'14:22', team:'—' },
];

export default function QueueTable({ data }) {
  const [queue, setQueue] = useState(data || MOCK_QUEUE);

  // Simulate live additions
  useEffect(() => {
    const names = ['Chest pain','Allergic reaction','Fall injury','Stroke symptoms'];
    const priorities = ['critical','high','moderate','low'];
    const dotMap = { critical:'red', high:'orange', moderate:'yellow', low:'green' };
    let id = 10;
    const t = setInterval(() => {
      const p = priorities[Math.floor(Math.random() * priorities.length)];
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      setQueue(q => {
        const entry = { priority:p, dot:dotMap[p], name:names[Math.floor(Math.random()*names.length)], id:String(id++).padStart(3,'0'), time, team:'—' };
        const order = { critical:0, high:1, moderate:2, low:3 };
        return [...q, entry].sort((a,b) => order[a.priority]-order[b.priority]).slice(0,8);
      });
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>CORE COMPONENT: live, color-coded and auto-sorting <em>Live Triage Queue</em></h2>
      </div>
      <div className="queue-table-wrap">
        <table className="queue-table">
          <tbody>
            {queue.map((r, i) => (
              <tr key={i} className={`${r.priority}-row`}>
                <td><span className={`q-dot ${r.dot}`}></span>{r.name}</td>
                <td style={{color:'#6b7280', fontSize:12}}>ID: {r.id}</td>
                <td style={{color:'#6b7280', fontSize:12}}>{r.time}</td>
                <td style={{color:'#6b7280', fontSize:12}}>{r.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
