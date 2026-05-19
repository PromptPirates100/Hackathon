// src/components/PatientForm.jsx
import { useState } from 'react';
import { useEmergencyStore } from '../context/EmergencyStore';
import UploadModal from './UploadModal';

const STEP_TEXTS = [
  'Analyzing emergency severity...',
  'Running triage intelligence...',
  'Evaluating logistics & hospital availability...',
  'Generating action plan...',
];

export default function PatientForm({ onTriageComplete }) {
  const { addPatient } = useEmergencyStore();
  const [form, setForm] = useState({
    name:'', age:'', gender:'', contact:'',
    bp:'', o2:'', hr:'', temp:'',
    incidentType:'', location:'', notes:'', symptoms:''
  });
  const [steps, setSteps]    = useState(STEP_TEXTS.map(() => 'pending'));
  const [btnState, setBtnState] = useState('idle');
  const [uploads, setUploads] = useState({ xray:null, wound:null, scan:null });
  const [modal, setModal]    = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleUploadDone = ({ type, file, analysis }) => {
    setUploads(u => ({ ...u, [type]: { file, analysis } }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setBtnState('loading');
    setSteps(STEP_TEXTS.map(() => 'pending'));

    let i = 0;
    const next = () => {
      setSteps(prev => prev.map((_, idx) =>
        idx < i ? 'done' : idx === i ? 'active' : 'pending'
      ));
      i++;
      if (i <= STEP_TEXTS.length) {
        setTimeout(next, 900);
      } else {
        setSteps(STEP_TEXTS.map(() => 'done'));
        setBtnState('done');
        // Submit to backend and get final patient data
        const formData = { ...form, uploads };
        addPatient(formData).then(patient => {
          if (onTriageComplete) onTriageComplete(patient);
        });
        setTimeout(() => setBtnState('idle'), 3000);
      }
    };
    next();
  };

  const uploadLabel = key => {
    if (uploads[key]) return '✓ ' + { xray:'X-Ray', wound:'Wound', scan:'Scan' }[key];
    return { xray:'X-Ray', wound:'Wound Image', scan:'CT/MRI Scan' }[key];
  };

  return (
    // ... (JSX unchanged, only the button onClick and prop changes)
    // Note: the form JSX is identical, just ensure onSubmit={handleSubmit}
    // and remove references to onAnalysisComplete
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {modal && (
        <UploadModal
          type={modal}
          severity="moderate"  // severity will be determined later
          onClose={() => setModal(null)}
          onComplete={result => { handleUploadDone(result); setModal(null); }}
        />
      )}

      <div className="panel" style={{ flex:1 }}>
        <h2>Emergency Intake Form</h2>
        <form onSubmit={handleSubmit}>
          {/* same form fields as before */}
          <div className="two-col">
            <div className="form-group"><label>Patient Name</label><input placeholder="Full name" value={form.name} onChange={set('name')} /></div>
            <div className="form-group"><label>Age</label><input type="number" placeholder="Age" value={form.age} onChange={set('age')} min="0" max="120" /></div>
          </div>
          <div className="two-col">
            <div className="form-group"><label>Gender</label>
              <select value={form.gender} onChange={set('gender')}>
                <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group"><label>Contact (optional)</label><input placeholder="Phone number" value={form.contact} onChange={set('contact')} /></div>
          </div>

          <div className="form-section-title">Vitals</div>
          <div className="two-col">
            <input placeholder="Blood Pressure (e.g. 120/80)" value={form.bp}   onChange={set('bp')} />
            <input placeholder="Oxygen Level (%)"              value={form.o2}   onChange={set('o2')} />
          </div>
          <div className="two-col" style={{ marginTop:8 }}>
            <input placeholder="Heart Rate (bpm)"              value={form.hr}   onChange={set('hr')} />
            <input placeholder="Temperature (°C)"              value={form.temp} onChange={set('temp')} />
          </div>

          <div className="form-section-title">Incident Details</div>
          <div className="two-col">
            <select value={form.incidentType} onChange={set('incidentType')}>
              <option value="">Accident Type</option>
              <option>Traffic Accident</option><option>Fall / Slip</option>
              <option>Cardiac Event</option><option>Respiratory Emergency</option>
              <option>Burns</option><option>Trauma / Assault</option><option>Other Medical</option>
            </select>
            <input placeholder="Location / Address" value={form.location} onChange={set('location')} />
          </div>
          <div className="form-group" style={{ marginTop:8 }}>
            <textarea rows={2} placeholder="Emergency notes..." value={form.notes} onChange={set('notes')} />
          </div>

          <div className="form-section-title">Symptoms</div>
          <div className="form-group">
            <textarea rows={4} className="symptoms-ta"
              placeholder="Describe symptoms in detail..."
              value={form.symptoms} onChange={set('symptoms')} />
          </div>

          <div className="form-section-title">Medical Images (Optional)</div>
          <div className="upload-row">
            {['xray','wound','scan'].map(k => (
              <button type="button" key={k}
                className={`upload-btn ${uploads[k] ? 'done' : ''}`}
                onClick={() => setModal(k)}>
                {uploadLabel(k)}
              </button>
            ))}
          </div>

          <button type="submit"
            className={`submit-btn ${btnState === 'done' ? 'done' : ''}`}
            disabled={btnState === 'loading'}>
            {btnState === 'loading' ? 'Analyzing...' : btnState === 'done' ? '✓ Submitted to Dashboard' : 'Analyze & Submit to Dashboard'}
          </button>
        </form>
      </div>

      {/* Processing steps panel – unchanged */}
      <div className="panel">
        <h4 style={{ fontSize:13, fontWeight:700, marginBottom:12, color:'#374151' }}>AI Processing Pipeline</h4>
        <ul className="step-list">
          {STEP_TEXTS.map((text, i) => (
            <li key={i} className={`step-item ${steps[i]}`}>
              <span className="step-icon">
                {steps[i] === 'done'    && <span style={{ color:'#16a34a', fontWeight:700 }}>✓</span>}
                {steps[i] === 'active'  && <span className="spinner"></span>}
                {steps[i] === 'pending' && <span className="step-dot"></span>}
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}