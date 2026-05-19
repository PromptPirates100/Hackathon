// src/components/UploadModal.jsx
import { useState, useRef, useCallback } from 'react';

// Simulated analysis results per file type
function generateAnalysis(type, fileName, severity) {
  const base = {
    xray: {
      findings: [
        'Lung fields appear clear bilaterally',
        severity === 'critical' ? '⚠ Possible pneumothorax detected — right side' : 'No significant pleural effusion observed',
        'Cardiac silhouette within normal limits',
        severity === 'high' ? '⚠ Mild cardiomegaly present' : 'Bony structures intact',
      ],
      recommendation: severity === 'critical'
        ? 'URGENT: Refer to District Hospital Ratnagiri immediately for CT chest.'
        : 'Monitor vitals. Follow-up X-ray in 24h recommended.',
      confidence: severity === 'critical' ? '91%' : '88%',
    },
    wound: {
      findings: [
        severity === 'critical' ? '⚠ Deep laceration detected — possible arterial involvement' : 'Superficial wound — no deep tissue damage visible',
        'Estimated wound size: ' + (severity === 'critical' ? '8–10 cm' : '2–4 cm'),
        severity === 'high' ? '⚠ Signs of early infection present' : 'Wound edges appear clean',
        'No foreign body detected in wound',
      ],
      recommendation: severity === 'critical'
        ? 'URGENT: Immediate surgical consult required. Control bleeding and transfer to Ratnagiri District Hospital.'
        : 'Clean, irrigate, and dress wound. Tetanus prophylaxis if not updated.',
      confidence: '85%',
    },
    scan: {
      findings: [
        severity === 'critical' ? '⚠ Intracranial hemorrhage suspected — urgent review needed' : 'No acute intracranial pathology detected',
        'Brain parenchyma — no midline shift observed',
        severity === 'high' ? '⚠ Mild cerebral edema noted' : 'Ventricles within normal size',
        'Bone windows — skull intact, no fracture lines',
      ],
      recommendation: severity === 'critical'
        ? 'URGENT: Immediate neurosurgery consult. Transfer to Ratnagiri District Hospital ICU.'
        : 'Neurological monitoring every 30 minutes. Repeat scan in 6 hours.',
      confidence: severity === 'critical' ? '93%' : '89%',
    },
  };
  return base[type] || base.xray;
}

export default function UploadModal({ type, onClose, onComplete, severity = 'moderate' }) {
  const [phase, setPhase] = useState('upload'); // upload | analyzing | results
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const typeLabels = { xray: 'X-Ray', wound: 'Wound Image', scan: 'CT/MRI Scan' };
  const typeIcons  = { xray: '🩻', wound: '🩹', scan: '🧠' };

  const handleFile = (f) => {
    if (!f) return;
    if (!['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(f.type)) {
      setError('Only PNG, JPG or PDF files are accepted.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) { setError('File too large. Max size is 10 MB.'); return; }
    setError('');
    setFile(f);
    if (f.type !== 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview('pdf');
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const runAnalysis = () => {
    setPhase('analyzing');
    setAnalysisProgress(0);
    const steps = [10, 25, 45, 60, 75, 88, 100];
    let i = 0;
    const tick = setInterval(() => {
      setAnalysisProgress(steps[i]);
      i++;
      if (i >= steps.length) {
        clearInterval(tick);
        const result = generateAnalysis(type, file?.name, severity);
        setAnalysis(result);
        setPhase('results');
      }
    }, 500);
  };

  const handleDone = () => {
    if (onComplete) onComplete({ type, file, analysis });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-type-icon">{typeIcons[type]}</span>
            <div>
              <h2>{typeLabels[type]} Upload</h2>
              <p>Upload PNG, JPG or PDF for AI analysis</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Phase: Upload ── */}
        {phase === 'upload' && (
          <div className="modal-body">
            <div
              className={`drop-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !file && inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.pdf" style={{ display:'none' }}
                onChange={(e) => handleFile(e.target.files[0])} />

              {!file ? (
                <>
                  <div className="drop-icon">📂</div>
                  <p className="drop-title">Drag &amp; drop or click to upload</p>
                  <p className="drop-sub">PNG, JPG or PDF — max 10 MB</p>
                </>
              ) : (
                <div className="file-preview">
                  {preview && preview !== 'pdf'
                    ? <img src={preview} alt="preview" className="preview-img" />
                    : <div className="pdf-placeholder">📄 PDF Document</div>
                  }
                  <div className="file-info">
                    <strong>{file.name}</strong>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button className="change-file-btn" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}>
                    Change file
                  </button>
                </div>
              )}
            </div>

            {error && <div className="upload-error">{error}</div>}

            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={onClose}>Cancel</button>
              <button className="modal-btn primary" disabled={!file} onClick={runAnalysis}>
                Analyze {typeLabels[type]}
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: Analyzing ── */}
        {phase === 'analyzing' && (
          <div className="modal-body analyzing-body">
            <div className="analyzing-icon">{typeIcons[type]}</div>
            <h3>Analyzing {typeLabels[type]}...</h3>
            <p className="analyzing-sub">AI is processing your medical image</p>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${analysisProgress}%` }}></div>
            </div>
            <p className="progress-label">{analysisProgress}% complete</p>
            <div className="analysis-steps">
              <div className={`astep ${analysisProgress >= 25 ? 'done' : analysisProgress >= 10 ? 'active' : ''}`}>📥 Loading image data</div>
              <div className={`astep ${analysisProgress >= 50 ? 'done' : analysisProgress >= 25 ? 'active' : ''}`}>🔍 Detecting anomalies</div>
              <div className={`astep ${analysisProgress >= 80 ? 'done' : analysisProgress >= 50 ? 'active' : ''}`}>🧠 AI model inference</div>
              <div className={`astep ${analysisProgress >= 100 ? 'done' : analysisProgress >= 80 ? 'active' : ''}`}>📋 Generating report</div>
            </div>
          </div>
        )}

        {/* ── Phase: Results ── */}
        {phase === 'results' && analysis && (
          <div className="modal-body">
            <div className="analysis-result-header">
              <span className="result-check">✓</span>
              <div>
                <h3>Analysis Complete</h3>
                <p>AI Confidence: <strong>{analysis.confidence}</strong></p>
              </div>
            </div>

            <div className="result-section">
              <h4>🔍 Findings</h4>
              <ul className="findings-list">
                {analysis.findings.map((f, i) => (
                  <li key={i} className={f.startsWith('⚠') ? 'finding-warning' : ''}>{f}</li>
                ))}
              </ul>
            </div>

            <div className={`result-recommendation ${severity === 'critical' || severity === 'high' ? 'urgent' : ''}`}>
              <h4>💊 Recommendation</h4>
              <p>{analysis.recommendation}</p>
            </div>

            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => { setPhase('upload'); setFile(null); setPreview(null); }}>
                Upload another
              </button>
              <button className="modal-btn primary" onClick={handleDone}>
                Save &amp; Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
