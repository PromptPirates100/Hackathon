// src/context/EmergencyStore.jsx
<<<<<<< HEAD
=======
// Global state + backend integration.
// When backend is reachable: calls POST /analyze/triage and syncs results.
// When backend is offline:   falls back to local AI simulation (no data loss).
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RATNAGIRI_HOSPITALS, TOTAL_BEDS } from '../constants/hospitals';
import { analyzeAPI, patientsAPI, alertsAPI } from '../services/api';

const StoreCtx = createContext(null);

// ── Helpers ──────────────────────────────────────────────────────────
let patientCounter = 0;
function generateId() {
  patientCounter++;
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `PG-${ymd}-${String(patientCounter).padStart(3,'0')}`;
}

function severityRank(s) {
  return { critical:0, high:1, moderate:2, low:3 }[s?.toLowerCase()] ?? 4;
}

<<<<<<< HEAD
=======
// Map backend priority string → frontend severity key
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
function priorityToSeverity(priority, riskScore) {
  if (!priority) return 'moderate';
  const p = priority.toUpperCase();
  if (p === 'RED')    return 'critical';
  if (p === 'ORANGE') return 'high';
  if (p === 'YELLOW') return 'moderate';
  if (p === 'GREEN')  return 'low';
<<<<<<< HEAD
=======
  // Fallback: use risk_score
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
  if (riskScore >= 75) return 'critical';
  if (riskScore >= 50) return 'high';
  if (riskScore >= 25) return 'moderate';
  return 'low';
<<<<<<< HEAD
=======
}

// Local severity estimation (used when backend is offline)
function estimateSeverity(form) {
  let score = 0;
  const o2 = parseFloat(form.o2), hr = parseFloat(form.hr), age = parseInt(form.age);
  if (!isNaN(o2) && o2 < 88)  score += 3;
  else if (!isNaN(o2) && o2 < 94) score += 1;
  if (!isNaN(hr) && (hr > 120 || hr < 40)) score += 2;
  if (!isNaN(age) && age >= 60) score += 1;
  const symp = (form.symptoms || '').toLowerCase();
  if (symp.includes('chest') || symp.includes('cardiac')) score += 3;
  if (symp.includes('breath')) score += 2;
  if (symp.includes('unconsci')) score += 3;
  if (form.incidentType === 'Cardiac Event')    score += 3;
  if (form.incidentType === 'Traffic Accident') score += 1;
  return score >= 6 ? 'critical' : score >= 3 ? 'high' : score >= 1 ? 'moderate' : 'low';
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
}

function assignHospital(severity) {
  if (severity === 'critical' || severity === 'high') return 'RH01';
  if (severity === 'moderate') return 'RH02';
  return 'RH04';
}

function computeMetrics(patients) {
  const active   = patients.length;
  const critical = patients.filter(p => p.severity === 'critical').length;
  const high     = patients.filter(p => p.severity === 'high').length;
  const moderate = patients.filter(p => p.severity === 'moderate').length;
  const highRisk = critical + high;
  const bedsUsed = critical*8 + high*4 + moderate*2 + Math.max(0, active - highRisk - moderate);
  return {
    active,
    highRisk,
    criticalAlerts: critical,
    loadPct:   Math.min(100, Math.round((bedsUsed / TOTAL_BEDS) * 100)),
    availBeds: Math.max(0, TOTAL_BEDS - bedsUsed),
  };
}

// ── Provider ─────────────────────────────────────────────────────────
export function EmergencyStoreProvider({ children }) {
  const [patients,       setPatients]       = useState([]);
  const [hospitals,      setHospitals]      = useState(RATNAGIRI_HOSPITALS);
  const [backendOnline,  setBackendOnline]  = useState(false);
<<<<<<< HEAD
  const [wsAlerts,       setWsAlerts]       = useState([]);

  // Check backend health on mount
=======
  const [wsAlerts,       setWsAlerts]       = useState([]);  // real-time WS events

  // ── Check backend health on mount ──────────────────────────────────
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
  useEffect(() => {
    fetch('/api/')
      .then(r => r.ok && setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

<<<<<<< HEAD
  // Poll GET /patients every 15s when backend is online
=======
  // ── Poll GET /patients every 15 s when backend is online ───────────
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
  useEffect(() => {
    if (!backendOnline) return;
    const sync = async () => {
      try {
        const data = await patientsAPI.getAll();
        const mapped = data.map(p => ({
          id:             p.patient_id,
          name:           p.patient_name,
          age:            p.age,
          gender:         '—',
          contact:        '—',
          incident:       p.notes?.split(' | ')[1] || 'Emergency',
          location:       p.location,
          symptoms:       Array.isArray(p.symptoms) ? p.symptoms.join(', ') : '',
          bp:             p.vitals?.bp || '—',
          o2:             p.vitals?.oxygen || '—',
          hr:             p.vitals?.heart_rate || '—',
          temp:           '—',
          severity:       priorityToSeverity(p.triage?.priority, p.triage?.risk_score),
          time:           new Date(p.timestamp * 1000).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
          date:           new Date(p.timestamp * 1000).toLocaleDateString('en-IN'),
          assignedHospId: 'RH01',
          triageData:     p.triage,
          logisticsData:  p.logistics,
          source:         'backend',
        }));
        setPatients(prev => {
<<<<<<< HEAD
=======
          // Merge: keep local-only entries, update/add backend ones
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
          const backendIds = new Set(mapped.map(p => p.id));
          const localOnly  = prev.filter(p => !backendIds.has(p.id) && p.source !== 'backend');
          return [...mapped, ...localOnly].sort((a,b) => severityRank(a.severity) - severityRank(b.severity));
        });
<<<<<<< HEAD
      } catch { /* backend offline */ }
=======
      } catch { /* backend went offline, keep current state */ }
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
    };
    sync();
    const timer = setInterval(sync, 15000);
    return () => clearInterval(timer);
  }, [backendOnline]);

<<<<<<< HEAD
  // ── addPatient (returns Promise<patient>) ─────────────────────────
  const addPatient = useCallback(async (formData) => {
    const now  = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    // Optimistic local entry
    const localId = generateId();
    const localSeverity = 'moderate'; // placeholder
    const hospId   = 'RH01';
=======
  // ── addPatient — called by PatientForm on submit ───────────────────
  const addPatient = useCallback(async (formData, localSeverity) => {
    const now  = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    // Optimistic local entry shown immediately
    const localId = generateId();
    const severity = localSeverity || estimateSeverity(formData);
    const hospId   = assignHospital(severity);
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4

    const optimistic = {
      id: localId, name: formData.name || 'Unknown', age: formData.age || '—',
      gender: formData.gender || '—', contact: formData.contact || '—',
      incident: formData.incidentType || 'General Emergency',
      location: formData.location || 'Ratnagiri, MH',
      symptoms: formData.symptoms || '', notes: formData.notes || '',
      bp: formData.bp || '—', o2: formData.o2 || '—',
      hr: formData.hr || '—', temp: formData.temp || '—',
<<<<<<< HEAD
      severity: localSeverity, time, date: now.toLocaleDateString('en-IN'),
=======
      severity, time, date: now.toLocaleDateString('en-IN'),
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
      assignedHospId: hospId, uploads: formData.uploads || {},
      source: 'local', triageData: null, logisticsData: null,
    };

    // Show immediately in queue
<<<<<<< HEAD
    setPatients(prev => [optimistic, ...prev].sort((a,b) => severityRank(a.severity) - severityRank(b.severity)));

    if (!backendOnline) {
      // Without backend, return the optimistic patient directly
      return optimistic;
    }

    try {
      const result = await analyzeAPI.triage(formData);
      const realSeverity = priorityToSeverity(result.triage?.priority, result.triage?.risk_score);
      const realHospId   = 'RH01'; // can be dynamic later

      const finalPatient = {
        ...optimistic,
        id:            result.patient_id,
        severity:      realSeverity,
        assignedHospId: realHospId,
        triageData:    result.triage,
        logisticsData: result.logistics,
        source:        'backend',
      };

      // Replace optimistic with backend-confirmed patient
      setPatients(prev =>
        prev
          .filter(p => p.id !== localId)
          .concat([finalPatient])
          .sort((a,b) => severityRank(a.severity) - severityRank(b.severity))
      );

      return finalPatient;
    } catch (err) {
      console.warn('[PulseGrid] Backend triage failed, keeping local result:', err.message);
      return optimistic;  // still return optimistic on failure
    }
  }, [backendOnline]);

  // Handle real-time WS alert
=======
    setPatients(prev =>
      [optimistic, ...prev].sort((a,b) => severityRank(a.severity) - severityRank(b.severity))
    );
    setHospitals(prev => prev.map(h =>
      h.id === hospId
        ? { ...h, usedBeds: Math.min(h.totalBeds, h.usedBeds + (severity === 'critical' ? 8 : severity === 'high' ? 4 : 2)) }
        : h
    ));

    // ── Try calling the real backend ──────────────────────────────────
    if (backendOnline) {
      try {
        const result = await analyzeAPI.triage(formData);
        const realSeverity = priorityToSeverity(result.triage?.priority, result.triage?.risk_score);

        // Replace the optimistic entry with backend-confirmed one
        setPatients(prev => prev
          .filter(p => p.id !== localId)
          .concat([{
            ...optimistic,
            id:            result.patient_id,
            severity:      realSeverity,
            assignedHospId: assignHospital(realSeverity),
            triageData:    result.triage,
            logisticsData: result.logistics,
            source:        'backend',
          }])
          .sort((a,b) => severityRank(a.severity) - severityRank(b.severity))
        );

        return { ...optimistic, id: result.patient_id, severity: realSeverity,
                 triageData: result.triage, logisticsData: result.logistics };
      } catch (err) {
        console.warn('[PulseGrid] Backend triage failed, keeping local result:', err.message);
      }
    }

    return optimistic;
  }, [backendOnline]);

  // ── Handle real-time WS alert (called from useWebSocket hook) ──────
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
  const handleWsAlert = useCallback((msg) => {
    if (msg?.type === 'critical_patient') {
      setWsAlerts(prev => [msg, ...prev].slice(0, 20));
    }
  }, []);

  const metrics = computeMetrics(patients);

  return (
    <StoreCtx.Provider value={{
      patients, hospitals, metrics,
      backendOnline, wsAlerts,
      addPatient, handleWsAlert,
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useEmergencyStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) return {
    patients:      [],
    hospitals:     RATNAGIRI_HOSPITALS,
    metrics:       { active:0, highRisk:0, criticalAlerts:0, loadPct:0, availBeds:TOTAL_BEDS },
    backendOnline: false,
    wsAlerts:      [],
<<<<<<< HEAD
    addPatient:    async () => {},
=======
    addPatient:    () => {},
>>>>>>> f1802f27deecd691559c1d22c266600b65cb4bf4
    handleWsAlert: () => {},
  };
  return ctx;
}