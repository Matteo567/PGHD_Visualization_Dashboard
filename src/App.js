/*
 App.js - Main Health Dashboard Application Component
 
 This is the root component that provides the main application structure.
 It manages patient selection and provides the main routing structure for the dashboard.
 
 Features:
 - Patient selection from 100 synthetic patients
 - Unified dashboard routing with screenshot mode
 - Error boundary and loading state management
 - Header with application title and controls
 
 Component Structure:
 - Header: Contains title and patient selector
 - Main: Contains the dashboard with error boundary and loading states
 - Dashboard: Renders HealthDashboard with screenshot mode support
 
 State Management:
 - selectedPatient: Currently selected patient ID
 - screenshotMode: Controls visibility of UI elements for screenshots
 */

import React, { useState } from 'react';
import PatientSelector from './PatientSelector';
import ErrorBoundary from './components/ErrorBoundary';
import HealthDashboard from './HealthDashboard';
import { PATIENTS } from './constants/index';
import './App.css';

  /*
   Main Health Dashboard Application
   Features unified health dashboard for patients and healthcare providers
   */
function App() {
  const [selectedPatient, setSelectedPatient] = useState('Patient_001');
  const [screenshotMode, setScreenshotMode] = useState(false); // Screenshot mode toggle

  const toggleScreenshotMode = () => {
    setScreenshotMode(prev => !prev);
  };

  return (
    <div className="app">
      <header className="app-header" style={{ display: screenshotMode ? 'none' : 'block' }}>
        <div className="header-content">
          <h1>Health Dashboard</h1>
          
          {/* Patient Selector */}
          <div className="patient-selector">
            <label htmlFor="patient-select">Select Patient:</label>
            <PatientSelector
              id="patient-select"
              patients={PATIENTS}
              value={selectedPatient}
              onChange={setSelectedPatient}
            />
          </div>

          {/* Screenshot Mode Toggle */}
          <div className="screenshot-toggle">
            <button 
              className="screenshot-mode-button"
              onClick={toggleScreenshotMode}
              title="Toggle screenshot mode - hides patient info, legends, and controls"
            >
              Screenshot Mode
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Floating screenshot mode toggle when in screenshot mode */}
        {screenshotMode && (
          <button 
            className="floating-screenshot-toggle"
            onClick={toggleScreenshotMode}
            title="Exit screenshot mode"
          >
            ✕ Exit Screenshot Mode
          </button>
        )}
        <ErrorBoundary>
          <HealthDashboard 
            patientId={selectedPatient} 
            screenshotMode={screenshotMode}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;