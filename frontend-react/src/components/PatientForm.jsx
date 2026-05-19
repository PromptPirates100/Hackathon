// src/components/PatientForm.jsx
import { useState } from 'react';

const STEP_TEXTS = [
  'Analyzing emergency severity...',
  'Running triage intelligence...',
  'Evaluating logistics & hospital availability...',
  'Generating action plan...',
];

export default function PatientForm({ onAnalysisComplete }) {
  const [form, setForm] = useState({ name:'', age:'', gender:'', contact:'', bp:'', o2:'', hr:'', temp:'', incidentType:'', location:'', notes:'', symptoms:'' });
  const [steps, setSteps] = useState(STEP_TEXTS.map(() => 'pending'));
  const [btnState, setBtnState] = useState('idle'); // idle | loading | done
  const [uploads, setUploads] = useState({ xray: false, wound: false, scan: false });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleUpload = (key) => {
    setUploads(u => ({ ...u, [key]: 'loading' }));
    setTimeout(() => setUploads(u => ({ ...u, [key]: 'done' })), 900);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBtnState('loading');
    setSteps(STEP_TEXTS.map(() => 'pending'));
    if (onAnalysisComplete) onAnalysisComplete(false);

    let i = 0;
    const next = () => {
      setSteps(prev => prev.map((s, idx) => {
        if (idx < i) return 'done';
        if (idx === i) return 'active';
        return 'pending';
      }));
      i++;
      if (i <= STEP_TEXTS.length) setTimeout(next, 900);
      else {
        setSteps(STEP_TEXTS.map(() => 'done'));
        setBtnState('done');
        if (onAnalysisComplete) onAnalysisComplete(true);
        setTimeout(() => setBtnState('idle'), 3000);
      }
    };
    next();
  };

  const uploadLabel = (key) => {
    const s = uploads[key];
    if (s === 'loading') return 'Uploading...';
    if (s === 'done') return '✓ Uploaded';
    return { xray: 'X-ray', wound: 'Wound image', scan: 'Scan' }[key];
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Patient Form Panel */}
      <div className="panel" style={{ flex: 1 }}>
        <h2>Free Emergency Intake Form</h2>
        <form id="intake-form" onSubmit={handleSubmit}>
          {/* Patient Info */}
          <div className="two-col">
            <div className="form-group">
              <label>Patient Information</label>
              <input placeholder="Name" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" value={form.age} onChange={set('age')} min="0" max="120" />
            </div>
          </div>
          <div className="two-col">
            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={set('gender')}>
                <option value="">Gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input placeholder="Contact (optional)" value={form.contact} onChange={set('contact')} />
            </div>
          </div>

          {/* Vitals */}
          <div className="form-section-title">Vitals Section</div>
          <div className="two-col">
            <input placeholder="Blood Pressure" value={form.bp} onChange={set('bp')} />
            <input placeholder="Oxygen Level (%)" value={form.o2} onChange={set('o2')} />
          </div>
          <div className="two-col" style={{ marginTop: 8 }}>
            <input placeholder="Heart Rate (bpm)" value={form.hr} onChange={set('hr')} />
            <input placeholder="Temperature (°C)" value={form.temp} onChange={set('temp')} />
          </div>

          {/* Incident */}
          <div className="form-section-title">Incident Context</div>
          <div className="two-col">
            <select value={form.incidentType} onChange={set('incidentType')}>
              <option value="">Accident Type</option>
              <option>Traffic Accident</option>
              <option>Fall / Slip</option>
              <option>Cardiac Event</option>
              <option>Respiratory</option>
              <option>Burns</option>
              <option>Other Medical</option>
            </select>
            <input placeholder="Location" value={form.location} onChange={set('location')} />
          </div>
          <div className="form-group" style={{ marginTop: 8 }}>
            <textarea rows={2} placeholder="Emergency Notes" value={form.notes} onChange={set('notes')} />
          </div>

          {/* Symptoms */}
          <div className="form-section-title">Symptoms Section</div>
          <div className="form-group">
            <textarea rows={5} className="symptoms-ta" placeholder="Enter symptoms (e.g., chest pain, dizziness, breathing difficulty)" value={form.symptoms} onChange={set('symptoms')} />
          </div>

          {/* Upload */}
          <div className="form-section-title">Upload Section</div>
          <div className="upload-row">
            {['xray','wound','scan'].map(k => (
              <button type="button" key={k} className={`upload-btn ${uploads[k] === 'done' ? 'done' : ''}`} onClick={() => handleUpload(k)}>
                {uploadLabel(k)}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className={`submit-btn ${btnState === 'done' ? 'done' : ''}`}
            disabled={btnState === 'loading'}
          >
            {btnState === 'loading' ? 'Analyzing...' : btnState === 'done' ? '✓ Analysis Complete' : 'Analyze Emergency Severity'}
          </button>
        </form>
      </div>

      {/* Processing Steps */}
      <div className="panel">
        <ul className="step-list">
          {STEP_TEXTS.map((text, i) => (
            <li key={i} className={`step-item ${steps[i]}`}>
              <span className="step-icon">
                {steps[i] === 'done'   && <span style={{color:'#2563eb',fontWeight:700}}>✓</span>}
                {steps[i] === 'active' && <span className="spinner"></span>}
                {steps[i] === 'pending'&& <span className="step-dot"></span>}
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
