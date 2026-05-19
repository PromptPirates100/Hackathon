// src/services/api.js
// Centralized API layer — all calls to the FastAPI backend go through here.
// Proxy: Vite forwards /api/* → http://localhost:8000/*

const BASE = '/api';

// ── Generic fetch helper ─────────────────────────────────────────────
async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

const get  = (path)        => request('GET',  path);
const post = (path, body)  => request('POST', path, body);

// ── Auth ─────────────────────────────────────────────────────────────
// NOTE: backend currently has no auth endpoint — keeping as stub.
// Replace body with { email, password, role } when backend adds /auth/login
export const authAPI = {
  login:  (email, password, role) => Promise.resolve({ email, role, name: role === 'admin' ? 'Dr. Admin' : 'Staff Member' }),
  logout: ()                       => Promise.resolve(),
};

// ── Triage / Analysis ─────────────────────────────────────────────────
// POST /analyze/triage
// Body matches PatientInput pydantic model
export const analyzeAPI = {
  /**
   * Submit a patient for AI triage.
   * Maps frontend form fields → backend PatientInput schema.
   */
  triage: (form) => post('/analyze/triage', {
    patient_name: form.name          || 'Unknown',
    age:          parseInt(form.age) || 0,
    symptoms:     form.symptoms
                    ? form.symptoms.split(/[,\n]+/).map(s => s.trim()).filter(Boolean)
                    : [],
    oxygen:       form.o2   ? parseInt(form.o2)   : null,
    bp:           form.bp   || null,
    heart_rate:   form.hr   ? parseInt(form.hr)   : null,
    notes:        [form.notes, form.incidentType, form.location].filter(Boolean).join(' | ') || '',
    location:     form.location || 'Ratnagiri, Maharashtra',
    image_url:    null,
  }),

  // POST /analyze/intake  (symptoms + vitals quick-check)
  intake: (symptoms, vitals, notes) => post('/analyze/intake', { symptoms, vitals, notes }),
};

// ── Patients ──────────────────────────────────────────────────────────
export const patientsAPI = {
  getAll:  ()           => get('/patients/'),
  getOne:  (id)         => get(`/patients/${id}`),
  save:    (data)       => post('/patients/', data),
};

// ── Alerts ────────────────────────────────────────────────────────────
export const alertsAPI = {
  getAll: () => get('/alerts/'),
};

// ── Analytics ─────────────────────────────────────────────────────────
export const analyticsAPI = {
  get: () => get('/analytics/'),
};

// ── Health check ──────────────────────────────────────────────────────
export const healthAPI = {
  ping: () => get('/'),
};

// ── WebSocket helper ──────────────────────────────────────────────────
// Usage: const socket = createWebSocket(onMessage)
export function createWebSocket(onMessage) {
  const url = `ws://${window.location.hostname}:8000/ws`;
  const ws  = new WebSocket(url);
  ws.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)); }
    catch { onMessage(e.data); }
  };
  ws.onerror = (e) => console.warn('[PulseGrid WS] error', e);
  return ws;
}
