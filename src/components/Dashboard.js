/*
 Dashboard.js - Unified Dashboard Router Component
 
 This component acts as a simple router that renders either the PatientDashboard or PhysicianDashboard based on the viewMode prop. It provides a clean separation between the two dashboard types while maintaining a unified interface.
 
 Purpose:
 - Central routing logic for dashboard views
 - Clean separation of concerns between patient and physician interfaces
 - Maintains consistent prop passing to child components
 
 Props:
 - patientId: The ID of the currently selected patient
 - viewMode: The current view mode ('patient' or 'physician')
 
 Component Flow:
 - Receives viewMode prop from parent App component
 - Conditionally renders appropriate dashboard based on viewMode
 - Passes patientId to the selected dashboard component
 */

import React from 'react';
import PatientDashboard from '../PatientDashboard';
import PhysicianDashboard from '../PhysicianDashboard';

/*
Unified Dashboard component that renders either Patient or Physician view based on the viewMode prop
 
 @param {string} patientId - The patient identifier
 @param {string} viewMode - The view mode ('patient' or 'physician')
 @param {boolean} screenshotMode - Whether screenshot mode is enabled
 @returns {JSX.Element} The appropriate dashboard component
 */
const Dashboard = ({ patientId, viewMode, screenshotMode = false }) => {
  if (viewMode === 'physician') {
    return <PhysicianDashboard patientId={patientId} screenshotMode={screenshotMode} />;
  }
  
  return <PatientDashboard patientId={patientId} screenshotMode={screenshotMode} />;
};

export default Dashboard;
