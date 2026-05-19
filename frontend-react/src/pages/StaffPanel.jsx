// src/pages/StaffPanel.jsx
import { useState } from 'react';
import PatientForm from '../components/PatientForm';
import AIReasoning from '../components/AIReasoning';

export default function StaffPanel() {
  // analysisData shape: { form: {...vitals, symptoms...}, uploads: {...} }
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <div className="page-content">
      <div className="page-title-row">
        <h1 className="page-title">Emergency Intake Panel</h1>
        <span className="live-count">Staff View</span>
      </div>
      <div className="intake-grid">

        {/* Left: Form + processing steps */}
        <PatientForm onAnalysisComplete={setAnalysisData} />

        {/* Right: Results after analysis */}
        <div className="results-col">
          {!analysisData ? (
            <div className="panel empty-results">
              <div className="empty-icon">🏥</div>
              <h3>Ready for Analysis</h3>
              <p>Fill in the patient details and click <strong>"Analyze &amp; Submit"</strong> to get:</p>
              <ul className="empty-list">
                <li>🤖 AI-powered triage result</li>
                <li>📋 Clinical reasoning</li>
                <li>🗺️ Nearest Ratnagiri hospitals map</li>
                <li>🚑 Transport &amp; ETA recommendation</li>
                <li>📊 Patient added to Admin Dashboard queue</li>
              </ul>
              <p className="empty-tip">You can also upload X-Ray, wound images or CT/MRI scans for additional AI analysis.</p>
            </div>
          ) : (
            <AIReasoning visible={true} data={analysisData} />
          )}
        </div>

      </div>
    </div>
  );
}
