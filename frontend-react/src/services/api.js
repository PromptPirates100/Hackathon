// src/services/api.js
// Centralised API layer — swap base URL and endpoints once backend is ready

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`);
  return res.json();
}

// ── Triage / Intake ────────────────────────────────────────────────
export const submitIntake = (data) => request('POST', '/triage/intake', data);
export const getTriageResult = (id) => request('GET', `/triage/${id}`);

// ── Queue ──────────────────────────────────────────────────────────
export const getQueue = () => request('GET', '/queue');
export const getQueueItem = (id) => request('GET', `/queue/${id}`);
export const updateQueueItem = (id, data) => request('PATCH', `/queue/${id}`, data);

// ── Hospitals ──────────────────────────────────────────────────────
export const getHospitals = () => request('GET', '/hospitals');
export const getHospital = (id) => request('GET', `/hospitals/${id}`);

// ── Alerts ────────────────────────────────────────────────────────
export const getAlerts = () => request('GET', '/alerts');
export const acknowledgeAlert = (id) => request('PATCH', `/alerts/${id}/acknowledge`);

// ── Analytics ─────────────────────────────────────────────────────
export const getMetrics = () => request('GET', '/analytics/metrics');
export const getTrends = () => request('GET', '/analytics/trends');
export const getSeverityDistribution = () => request('GET', '/analytics/severity');
export const getHospitalUtilization = () => request('GET', '/analytics/utilization');

// ── AI Insights ───────────────────────────────────────────────────
export const getAIInsights = () => request('GET', '/ai/insights');

// ── System Logs ───────────────────────────────────────────────────
export const getLogs = (filter) => request('GET', `/logs${filter ? `?type=${filter}` : ''}`);

export default { submitIntake, getTriageResult, getQueue, getHospitals, getAlerts, getMetrics, getTrends, getAIInsights, getLogs };
