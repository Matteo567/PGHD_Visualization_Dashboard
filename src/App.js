/*
 App.js - Main Health Dashboard Application Component
 
 This is the root component that provides the main application structure.
 It manages the role toggle between Patient and Physician views, patient selection,
 and provides the main routing structure for the dashboard.
 
 Features:
 - Role toggle between Patient and Physician views
 - Patient selection from 100 synthetic patients
 - Unified dashboard routing with lazy loading
 - Error boundary and loading state management
 - Header with application title and controls
 
 Component Structure:
 - Header: Contains title, role toggle, and patient selector
 - Main: Contains the dashboard with error boundary and loading states
 - Dashboard: Renders either PatientDashboard or PhysicianDashboard based on role
 
 State Management:
 - selectedPatient: Currently selected patient ID
 - currentRole: Current view mode ('patient' or 'physician')
 */

import React, { useState } from 'react';
import PatientSelector from './PatientSelector';
import ErrorBoundary from './components/ErrorBoundary';
import Switch from './components/ui/Switch';
import Dashboard from './components/Dashboard';
import { PATIENTS } from './constants/index';
import './App.css';

  /*
   Main Health Dashboard Application
   Features both Patient and Physician views with role toggle
   */
function App() {
  const [selectedPatient, setSelectedPatient] = useState('Patient_001');
  const [currentRole, setCurrentRole] = useState('patient'); // 'patient' or 'physician'
  const [screenshotMode, setScreenshotMode] = useState(false); // Screenshot mode toggle

  const toggleRole = () => {
    setCurrentRole(prev => prev === 'patient' ? 'physician' : 'patient');
  };

  const toggleScreenshotMode = () => {
    setScreenshotMode(prev => !prev);
  };

  return (
    <div className="app">
      <header className="app-header" style={{ display: screenshotMode ? 'none' : 'block' }}>
        <div className="header-content">
          <h1>Health Dashboard</h1>
          
          {/* Role Toggle */}
          <div className="role-toggle">
            <Switch
              checked={currentRole === 'physician'}
              onChange={toggleRole}
              leftLabel="Patient View"
              rightLabel="Physician View"
            />
          </div>

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
          <Dashboard 
            patientId={selectedPatient} 
            viewMode={currentRole}
            screenshotMode={screenshotMode}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;