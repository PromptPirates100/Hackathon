// analytics.js — Analytics page charts

Chart.defaults.font.family = 'Inter';
Chart.defaults.font.size = 11;
Chart.defaults.color = '#6b7280';

const hours = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];

// Emergency Trends (large)
new Chart(document.getElementById('trendsLarge'), {
  type: 'line',
  data: {
    labels: hours,
    datasets: [
      { label: 'Critical', data: [5,8,14,20,18,22,17,12,8], borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.08)', fill: true, tension: 0.4, pointRadius: 4 },
      { label: 'High',     data: [8,12,18,25,22,28,20,15,10], borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.08)', fill: true, tension: 0.4, pointRadius: 4 },
      { label: 'Moderate', data: [10,14,20,28,25,30,22,18,12], borderColor: '#d97706', backgroundColor: 'rgba(217,119,6,0.06)', fill: true, tension: 0.4, pointRadius: 4 }
    ]
  },
  options: {
    plugins: { legend: { display: true, position: 'top' } },
    scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
  }
});

// Severity Donut
new Chart(document.getElementById('severityLarge'), {
  type: 'doughnut',
  data: {
    labels: ['Critical (Red)', 'High (Orange)', 'Moderate (Yellow)', 'Low (Blue)'],
    datasets: [{ data: [18, 22, 28, 12], backgroundColor: ['#dc2626','#ea580c','#d97706','#2563eb'], borderWidth: 2, borderColor: '#fff' }]
  },
  options: { cutout: '60%', plugins: { legend: { display: true, position: 'bottom' } } }
});

// Hospital Utilization
new Chart(document.getElementById('utilizationLarge'), {
  type: 'bar',
  data: {
    labels: ['City Trauma', 'Metro Hosp.', 'Emergency A', 'St. Marys', 'North Gen', 'Riverside'],
    datasets: [{ label: 'Utilization %', data: [88,62,100,35,40,70], backgroundColor: ['#dc2626','#ea580c','#991b1b','#16a34a','#16a34a','#ea580c'], borderRadius: 5 }]
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } } }
});

// Response time by shift
new Chart(document.getElementById('responseChart'), {
  type: 'bar',
  data: {
    labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
    datasets: [{ label: 'Avg Response (min)', data: [9.2, 11.4, 13.1, 8.7], backgroundColor: '#2563eb', borderRadius: 5 }]
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
});

// Cases by incident type
new Chart(document.getElementById('incidentChart'), {
  type: 'doughnut',
  data: {
    labels: ['Traffic', 'Cardiac', 'Respiratory', 'Trauma', 'Other'],
    datasets: [{ data: [24, 18, 12, 15, 11], backgroundColor: ['#2563eb','#dc2626','#d97706','#ea580c','#9ca3af'], borderWidth: 2, borderColor: '#fff' }]
  },
  options: { cutout: '55%', plugins: { legend: { display: true, position: 'bottom' } } }
});
