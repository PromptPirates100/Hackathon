// dashboard.js — Admin Dashboard logic

// ── Chart.js defaults ──────────────────────────────────────────────────────
Chart.defaults.font.family = 'Inter';
Chart.defaults.font.size = 11;
Chart.defaults.color = '#6b7280';
Chart.defaults.plugins.legend.display = false;

// ── Severity Donut ─────────────────────────────────────────────────────────
new Chart(document.getElementById('severityChart'), {
  type: 'doughnut',
  data: {
    labels: ['Red', 'Yellow', 'Blue'],
    datasets: [{
      data: [18, 22, 12],
      backgroundColor: ['#dc2626', '#d97706', '#2563eb'],
      borderWidth: 2, borderColor: '#fff'
    }]
  },
  options: { cutout: '65%', plugins: { legend: { display: true, position: 'bottom' } } }
});

// ── Emergency Trends Line ──────────────────────────────────────────────────
new Chart(document.getElementById('trendsChart'), {
  type: 'line',
  data: {
    labels: ['08:00','10:00','12:00','14:00','16:00'],
    datasets: [
      { data: [20,35,45,60,52], borderColor: '#dc2626', fill: false, tension: 0.4, pointRadius: 3 },
      { data: [30,28,32,40,38], borderColor: '#2563eb', fill: false, tension: 0.4, pointRadius: 3 }
    ]
  },
  options: { scales: { x: { grid: { display: false } }, y: { beginAtZero: true, max: 100 } } }
});

// ── Hospital Utilization Bar ───────────────────────────────────────────────
new Chart(document.getElementById('utilizationChart'), {
  type: 'bar',
  data: {
    labels: ['CTC','Metro','EUA','SMM','NGH','RC'],
    datasets: [{
      data: [88,62,100,35,40,70],
      backgroundColor: ['#dc2626','#ea580c','#991b1b','#16a34a','#16a34a','#ea580c'],
      borderRadius: 4
    }]
  },
  options: { scales: { y: { beginAtZero: true, max: 100 } } }
});

// ── Sparklines ─────────────────────────────────────────────────────────────
function sparkline(id, data, color) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.map((_,i) => i),
      datasets: [{ data, borderColor: color, fill: false, tension: 0.4, pointRadius: 0, borderWidth: 2 }]
    },
    options: {
      animation: false,
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}
sparkline('spark1', [40,55,70,65,80,88,88], '#dc2626');
sparkline('spark2', [50,45,55,60,62,58,62], '#ea580c');
sparkline('spark3', [80,90,95,98,100,100,100], '#991b1b');
sparkline('spark4', [60,50,40,35,38,35,35], '#16a34a');

// ── Live metric ticker ──────────────────────────────────────────────────────
function fluctuate(elId, base, range) {
  const el = document.getElementById(elId);
  if (!el) return;
  setInterval(() => {
    const v = base + Math.floor(Math.random() * range * 2) - range;
    el.textContent = el.dataset.unit ? v + el.dataset.unit : v;
  }, 4000);
}
fluctuate('m-active', 52, 2);
fluctuate('m-high', 18, 1);
fluctuate('m-beds', 24, 2);
