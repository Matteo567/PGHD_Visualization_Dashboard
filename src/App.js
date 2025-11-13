/*
 App.js - Main Health Dashboard Application Component
 
 This is the root component that provides the main application structure. It manages patient selection and provides the main routing structure for the dashboard. The component handles patient selection from 100 synthetic patients and provides unified dashboard routing. It includes error boundary and loading state management. The header contains the application title and controls. The main section contains the dashboard with error boundary and loading states. The dashboard renders HealthDashboard. State management includes the currently selected patient ID.
 */

import React, { useState } from 'react';
import PatientSelector from './PatientSelector';
import AccessTypeSelector from './AccessTypeSelector';
import ErrorBoundary from './components/ErrorBoundary';
import HealthDashboard from './HealthDashboard';
import { PATIENTS } from './constants/index';
import './App.css';

  /*
   Main Health Dashboard Application
   Provides unified health dashboard for patients and healthcare providers
   */
function App() {
  const [selectedPatient, setSelectedPatient] = useState('Patient_001');
  const [accessType, setAccessType] = useState('Admin');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Patient-Generated Health Data (PGHD) Visualization System</h1>
          
          {/* Selectors Container */}
          <div className="selectors-container">
            {/* Access Type Selector */}
            <div className="access-type-selector">
              <AccessTypeSelector
                value={accessType}
                onChange={setAccessType}
              />
            </div>

            {/* Patient Selector */}
            <div className="patient-selector">
              <PatientSelector
                patients={PATIENTS}
                value={selectedPatient}
                onChange={setSelectedPatient}
              />
            </div>
          </div>

        </div>
      </header>

      <main className="app-main">
        <ErrorBoundary>
          <HealthDashboard 
            patientId={selectedPatient}
            accessType={accessType}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;