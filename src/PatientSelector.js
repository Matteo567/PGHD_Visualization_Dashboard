/**
 PatientSelector.js - Patient Selection Dropdown Component
 
 A simple dropdown component that allows users to select from available patients.
 Displays patient IDs in a formatted list and handles selection changes.
 Used in the main app header for switching between different patient datasets.
 */

import React from 'react';
import './PatientSelector.css';

const PatientSelector = ({ patients, value, onChange }) => (
  <div className="patient-selector-container">
    <label htmlFor="patient-select" className="patient-selector-label">
      Patient ID:
    </label>
    <select
      id="patient-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="patient-selector-select"
    >
      {patients.map(patientId => (
        <option key={patientId} value={patientId}>{patientId}</option>
      ))}
    </select>
  </div>
);

export default PatientSelector;
