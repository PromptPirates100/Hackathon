// live-queue.js — Live Queue page logic

const queueData = [
  { priority: 'critical', dot: 'red',    name: 'Multi-trauma accident',  id: '001', time: '14:02', vitals: 'BP 90/60, O2 88%', location: 'Highway 4', team: 'Team A',  status: 'En Route' },
  { priority: 'high',     dot: 'orange', name: 'Cardiac emergency',      id: '002', time: '14:05', vitals: 'BP 150/95, HR 110', location: 'Downtown',  team: 'Team B',  status: 'Dispatched' },
  { priority: 'moderate', dot: 'yellow', name: 'Head injury',            id: '003', time: '14:12', vitals: 'BP 130/80, O2 96%', location: 'Park Ave',  team: '—',       status: 'Pending' },
  { priority: 'low',      dot: 'yellow', name: 'Fever case',             id: '004', time: '14:18', vitals: 'Temp 39.1°C',       location: 'Clinic B',  team: '—',       status: 'Pending' },
  { priority: 'low',      dot: 'green',  name: 'Minor laceration',       id: '005', time: '14:22', vitals: 'Stable',             location: 'Market St', team: '—',       status: 'Waiting' },
  { priority: 'critical', dot: 'red',    name: 'Respiratory failure',    id: '006', time: '14:25', vitals: 'O2 82%, RR 28',     location: 'North End', team: 'Team C',  status: 'En Route' },
  { priority: 'high',     dot: 'orange', name: 'Burns (30% BSA)',        id: '007', time: '14:28', vitals: 'BP 110/70',         location: 'Factory Rd', team: 'Team D', status: 'Dispatched' },
  { priority: 'moderate', dot: 'yellow', name: 'Diabetic emergency',     id: '008', time: '14:31', vitals: 'Glucose 40 mg/dL',  location: 'Suburb',    team: '—',       status: 'Pending' },
  { priority: 'low',      dot: 'green',  name: 'Ankle sprain',           id: '009', time: '14:35', vitals: 'Stable',             location: 'Sports Hall', team: '—',    status: 'Waiting' },
  { priority: 'high',     dot: 'orange', name: 'Stroke symptoms',        id: '010', time: '14:38', vitals: 'BP 180/110',        location: 'Old Town',  team: 'Team A',  status: 'En Route' },
];

const statusColors = {
  'En Route': '#16a34a', 'Dispatched': '#2563eb', 'Pending': '#d97706', 'Waiting': '#6b7280'
};

function buildRows(data) {
  const tbody = document.getElementById('fullQueueBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.forEach(r => {
    const tr = document.createElement('tr');
    tr.dataset.priority = r.priority;
    tr.innerHTML = `
      <td><span class="q-dot ${r.dot}"></span></td>
      <td><strong>${r.name}</strong></td>
      <td>ID: ${r.id}</td>
      <td>${r.time}</td>
      <td style="font-size:12px;color:#6b7280">${r.vitals}</td>
      <td>${r.location}</td>
      <td>${r.team}</td>
      <td><span style="color:${statusColors[r.status]};font-weight:600;font-size:12px">${r.status}</span></td>
      <td><button class="tbl-action-btn" onclick="viewCase('${r.id}')">View</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function viewCase(id) {
  alert(`Case ID: ${id}\nFull case view will be available when backend is connected.`);
}

// Sort: critical → high → moderate → low
const order = { critical: 0, high: 1, moderate: 2, low: 3 };
const sorted = [...queueData].sort((a, b) => order[a.priority] - order[b.priority]);
buildRows(sorted);

// Filter buttons
document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    const filtered = f === 'all' ? sorted : sorted.filter(r => r.priority === f);
    buildRows(filtered);
  });
});

// Auto-add new row every 8 seconds (simulate live)
let nextId = 11;
setInterval(() => {
  const priorities = ['critical','high','moderate','low'];
  const dotMap = { critical:'red', high:'orange', moderate:'yellow', low:'green' };
  const names = ['Chest pain case','Allergic reaction','Fall injury','Breathing difficulty','Eye trauma'];
  const p = priorities[Math.floor(Math.random() * priorities.length)];
  const now = new Date();
  const t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  const entry = { priority: p, dot: dotMap[p], name: names[Math.floor(Math.random()*names.length)], id: String(nextId++).padStart(3,'0'), time: t, vitals: 'Incoming', location: 'TBD', team: '—', status: 'Pending' };
  queueData.unshift(entry);
  const resorted = [...queueData].sort((a,b) => order[a.priority]-order[b.priority]);
  buildRows(resorted);
}, 8000);
