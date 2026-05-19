// src/pages/StaffPanel.jsx
import { useState } from 'react';
import PatientForm from '../components/PatientForm';
import AIReasoning from '../components/AIReasoning';

export default function StaffPanel() {
  const [patientData, setPatientData] = useState(null);

  // Called by PatientForm when the backend returns the complete patient object
  const handleTriageComplete = (patient) => {
    setPatientData(patient);
  };

  return (
    <div className="page-content">
      <div className="page-title-row">
        <h1 className="page-title">Emergency Intake Panel</h1>
        <span className="live-count">Staff View</span>
      </div>
      <div className="intake-grid">
        {/* Left column: the form you already have */}
        <PatientForm onTriageComplete={handleTriageComplete} />

        {/* Right column: now shows AI result after submission */}
        <div className="results-col">
          {!patientData ? (
            <div className="panel empty-results">
              <div className="empty-icon">🏥</div>
              <h3>Ready for Analysis</h3>
              <p>Fill in the patient details and click <strong>"Analyze &amp; Submit"</strong> to get:</p>
              <ul className="empty-list">
                <li>🤖 AI-powered triage result</li>
                <li>📋 Clinical reasoning &amp; recommendations</li>
                <li>🗺️ Nearest Ratnagiri hospitals on live map</li>
                <li>🚑 Transport &amp; ETA recommendation</li>
                <li>📊 Patient added to Admin Dashboard queue</li>
              </ul>
              <p className="empty-tip">You can also upload X-Ray, wound images or CT/MRI scans for additional AI analysis.</p>
            </div>
          ) : (
            <AIReasoning visible={true} data={patientData} />
          )}
        </div>
      </div>
    </div>
  );
}