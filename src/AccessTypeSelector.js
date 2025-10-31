/**
 AccessTypeSelector.js - Access Type Selection Dropdown Component
 
 A dropdown component that allows users to select the access type.
 Displays access types: Patient, Physician, and Admin.
 Used in the main app header for switching between different access levels.
 */

import React from 'react';
import './AccessTypeSelector.css';

const AccessTypeSelector = ({ value, onChange }) => (
  <div className="access-type-selector-container">
    <label htmlFor="access-type-select" className="access-type-selector-label">
      Access type:
    </label>
    <select
      id="access-type-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="access-type-selector-select"
    >
      <option value="Patient">Patient</option>
      <option value="Physician">Physician</option>
      <option value="Admin">Admin</option>
    </select>
  </div>
);

export default AccessTypeSelector;

