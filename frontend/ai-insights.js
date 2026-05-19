// ai-insights.js — AI Insights page

Chart.defaults.font.family = 'Inter';
Chart.defaults.font.size = 11;
Chart.defaults.color = '#6b7280';

// AI Prediction Accuracy chart
new Chart(document.getElementById('aiAccuracyChart'), {
  type: 'line',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Triage Accuracy %',
        data: [88, 91, 89, 93, 94, 92, 95],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.08)',
        fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#2563eb'
      },
      {
        label: 'Routing Accuracy %',
        data: [82, 85, 88, 87, 90, 91, 92],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.06)',
        fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#16a34a'
      }
    ]
  },
  options: {
    plugins: { legend: { display: true, position: 'top' } },
    scales: {
      y: { min: 70, max: 100, ticks: { callback: v => v + '%' } },
      x: { grid: { display: false } }
    }
  }
});

// Animate confidence bars on load
document.querySelectorAll('.insight-confidence strong').forEach(el => {
  const target = parseInt(el.textContent);
  let current = 0;
  const step = target / 40;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current) + '%';
    if (current >= target) clearInterval(timer);
  }, 20);
});
