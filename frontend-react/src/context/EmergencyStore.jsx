// src/context/EmergencyStore.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { RATNAGIRI_HOSPITALS, TOTAL_BEDS } from '../constants/hospitals';

const StoreCtx = createContext(null);

let patientCounter = 0;
function generateId() {
  patientCounter++;
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `PG-${ymd}-${String(patientCounter).padStart(3,'0')}`;
}

function severityRank(s) {
  return { critical:0, high:1, moderate:2, low:3 }[s] ?? 4;
}

function computeMetrics(patients) {
  const active    = patients.length;
  const critical  = patients.filter(p => p.severity === 'critical').length;
  const high      = patients.filter(p => p.severity === 'high').length;
  const moderate  = patients.filter(p => p.severity === 'moderate').length;
  const highRisk  = critical + high;
  const bedsUsed  = critical*8 + high*4 + moderate*2 + Math.max(0, active - highRisk - moderate);
  const availBeds = Math.max(0, TOTAL_BEDS - bedsUsed);
  const loadPct   = Math.min(100, Math.round((bedsUsed / TOTAL_BEDS) * 100));
  return { active, highRisk, criticalAlerts: critical, loadPct, availBeds };
}

function assignHospital(severity) {
  if (severity === 'critical' || severity === 'high') return 'RH01';
  if (severity === 'moderate') return 'RH02';
  return 'RH04';
}

export function EmergencyStoreProvider({ children }) {
  const [patients,  setPatients]  = useState([]);
  const [hospitals, setHospitals] = useState(RATNAGIRI_HOSPITALS);

  const addPatient = useCallback((formData, severity) => {
    const id     = generateId();
    const now    = new Date();
    const time   = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const hospId = assignHospital(severity);

    const patient = {
      id,
      name:           formData.name         || 'Unknown Patient',
      age:            formData.age           || '—',
      gender:         formData.gender        || '—',
      contact:        formData.contact       || '—',
      incident:       formData.incidentType  || 'General Emergency',
      location:       formData.location      || 'Unknown',
      symptoms:       formData.symptoms      || '',
      notes:          formData.notes         || '',
      bp:             formData.bp            || '—',
      o2:             formData.o2            || '—',
      hr:             formData.hr            || '—',
      temp:           formData.temp          || '—',
      severity,
      time,
      date:           now.toLocaleDateString('en-IN'),
      assignedHospId: hospId,
      uploads:        formData.uploads       || {},
    };

    setPatients(prev =>
      [patient, ...prev].sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    );

    setHospitals(prev => prev.map(h =>
      h.id === hospId
        ? { ...h, usedBeds: Math.min(h.totalBeds, h.usedBeds + (severity === 'critical' ? 8 : severity === 'high' ? 4 : 2)) }
        : h
    ));

    return patient;
  }, []);

  const metrics = computeMetrics(patients);

  return (
    <StoreCtx.Provider value={{ patients, hospitals, metrics, addPatient }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useEmergencyStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) return {
    patients:   [],
    hospitals:  RATNAGIRI_HOSPITALS,
    metrics:    { active:0, highRisk:0, criticalAlerts:0, loadPct:0, availBeds:TOTAL_BEDS },
    addPatient: () => {},
  };
  return ctx;
}
