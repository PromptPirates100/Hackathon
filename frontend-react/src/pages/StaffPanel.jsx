// src/pages/StaffPanel.jsx
import { useState } from 'react';
import PatientForm from '../components/PatientForm';
import TriageCard from '../components/TriageCard';
import AIReasoning from '../components/AIReasoning';

export default function StaffPanel() {
  const [resultsVisible, setResultsVisible] = useState(false);

  return (
    <div className="page-content">
      <div className="page-title-row">
        <h1 className="page-title">Emergency Intake Panel</h1>
      </div>
      <div className="intake-grid">
        {/* Left: Patient Form + Processing Steps */}
        <PatientForm onAnalysisComplete={setResultsVisible} />

        {/* Right: Results */}
        <div className="results-col">
          <TriageCard visible={resultsVisible} />
          <AIReasoning visible={resultsVisible} />
          {!resultsVisible && (
            <div className="panel" style={{ color:'#9ca3af', fontSize:13, textAlign:'center', padding:40 }}>
              Fill in the patient form and click <strong style={{color:'#2563eb'}}>"Analyze Emergency Severity"</strong> to see AI triage results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
