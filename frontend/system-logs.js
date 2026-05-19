// system-logs.js — Live system log stream

const logData = [
  { time:'14:38', type:'triage',   msg:'Case ID 010 auto-escalated — stroke symptoms detected (BP 180/110)' },
  { time:'14:35', type:'fleet',    msg:'Ambulance Unit 03 dispatched to Old Town — ETA 8 min' },
  { time:'14:31', type:'triage',   msg:'New intake: Diabetic emergency (Glucose 40 mg/dL) — ID 008 created' },
  { time:'14:28', type:'hospital', msg:'Emergency Unit A at 100% ICU capacity — divert flag enabled' },
  { time:'14:25', type:'triage',   msg:'Case ID 006: Respiratory failure — O2 82%, priority set CRITICAL' },
  { time:'14:22', type:'fleet',    msg:'Unit 07 rerouted via Highway 4 — traffic delay avoided, saved 4 min' },
  { time:'14:18', type:'ai',       msg:'AI model flagged Case ID 002 high cardiac risk — cardiologist pre-alerted' },
  { time:'14:15', type:'system',   msg:'Database sync completed — 52 active cases loaded' },
  { time:'14:12', type:'triage',   msg:'Case ID 003: Head injury — CT scan recommended, moderate priority' },
  { time:'14:10', type:'hospital', msg:'Metro Hospital ICU at 62% — accepting moderate & high cases' },
  { time:'14:05', type:'fleet',    msg:'Team B dispatched to Downtown — cardiac emergency (ID 002)' },
  { time:'14:02', type:'triage',   msg:'Case ID 001: Multi-trauma accident — priority CRITICAL, Team A assigned' },
  { time:'13:55', type:'ai',       msg:'AI detected 32% surge in emergency load — alert raised' },
  { time:'13:45', type:'fleet',    msg:'Unit 07 delayed — traffic reroute applied automatically' },
  { time:'13:40', type:'system',   msg:'Live System activated — all monitoring modules online' },
  { time:'13:20', type:'hospital', msg:'St. Marys ICU reached 35% — all teams available' },
  { time:'13:00', type:'system',   msg:'Shift change logged — afternoon team on duty' },
];

let activeFilter = 'all';

function renderLogs(data) {
  const stream = document.getElementById('logStream');
  if (!stream) return;
  stream.innerHTML = '';
  const filtered = activeFilter === 'all' ? data : data.filter(l => l.type === activeFilter);
  filtered.forEach(l => {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.dataset.type = l.type;
    div.innerHTML = `
      <span class="log-time">${l.time}</span>
      <span class="log-type"><span class="${l.type}">${l.type.toUpperCase()}</span></span>
      <span class="log-msg">${l.msg}</span>
    `;
    stream.appendChild(div);
  });
}

renderLogs(logData);

// Filter buttons
document.querySelectorAll('.filter-btn[data-log]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-log]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.log;
    renderLogs(logData);
  });
});

// Search
const search = document.getElementById('logSearch');
if (search) {
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    const filtered = logData.filter(l => l.msg.toLowerCase().includes(q) || l.type.includes(q));
    renderLogs(filtered);
  });
}

// Simulate new log entries every 6 seconds
const newMsgs = [
  { type:'ai',       msg:'AI model updated triage priority for Case ID 005' },
  { type:'fleet',    msg:'Ambulance Unit 02 returned to base — available for dispatch' },
  { type:'hospital', msg:'City Trauma Center trauma bay cleared — 1 slot available' },
  { type:'triage',   msg:'New intake submitted — processing triage score...' },
  { type:'system',   msg:'Heartbeat check: all services healthy' },
];
let msgIdx = 0;
setInterval(() => {
  const now = new Date();
  const t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  const entry = { time: t, ...newMsgs[msgIdx % newMsgs.length] };
  logData.unshift(entry);
  msgIdx++;
  renderLogs(logData);
}, 6000);
