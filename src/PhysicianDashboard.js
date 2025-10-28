/*
 PhysicianDashboard.js - Physician View Dashboard Component
 
 This component renders the physician-focused dashboard view with clinical overview
 optimized for healthcare providers, patient information with medical context,
 chart expansion capabilities, and support for clinical notes and observations.
 
 Architecture:
 - Designed for physicians to monitor multiple health metrics simultaneously
 - Provides clinical summaries and statistical analysis
 - Implements professional medical interface design
 - Handles patient selection and data validation
 
 Custom Hooks Used:
 - usePatientData: Manages patient data fetching and caching
 - useVisualizations: Handles visualization configuration and availability
 - useVisualizationHelpers: Provides chart expansion and rendering utilities
 - useChartNavigation: Manages time-based navigation for each chart type
 
 Component Structure:
 - Physician header with clinical context
 - PatientInfoCard: Displays patient demographics and medical information
 - DashboardGrid: Renders the chart grid with clinical summaries
 - Individual chart components with physician-specific features
 
 State Management:
 - Manages selected patient state independently from parent
 - Uses custom hooks for centralized state management
 - Handles chart expansion state through useVisualizationHelpers
 - Manages navigation state for each chart type independently
 
 Clinical Features:
 - Summary statistics for each health metric
 - Trend analysis and pattern recognition
 - Professional medical interface design
 - Comprehensive data visualization for clinical decision making
 */

import React, { useState } from 'react';
import usePatientData from './hooks/usePatientData';
import useVisualizations from './hooks/useVisualizations';
import useChartNavigation from './hooks/useChartNavigation';
import PatientInfoCard from './components/PatientInfoCard';
import DashboardGrid from './components/DashboardGrid';
import Placeholder from './components/ui/Placeholder';
import './PhysicianDashboard.css';

const PhysicianDashboard = ({ patientId, screenshotMode = false }) => {
  const { data, loading, error } = usePatientData(patientId);

  const { 
    allVisualizations, 
    availableVisualizations, 
    selectedVisualizations, 
    handleVisualizationChange 
  } = useVisualizations('physician', data);

  // Simplified: Inline expanded state (no separate hook needed)
  const [expandedChart, setExpandedChart] = useState(null);

  const handleExpand = (chartId) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  // Simplified: Single shared navigation for all charts
  const sharedNavigation = useChartNavigation('glucose'); // Default to 'week' navigation

  const chartNavigation = {
    glucose: sharedNavigation,
    bloodPressure: sharedNavigation,
    exercise: sharedNavigation,
    sleep: sharedNavigation,
    pain: sharedNavigation,
    mood: useChartNavigation('mood'), // Mood uses month navigation, so keep separate
    mealContents: sharedNavigation
  };

  // Simplified: Direct rendering - no render props needed
  const renderVisualizationWithMode = (visualizationType, windowId) => {
    if (!patientId) {
      return <Placeholder message="Please select a patient to view data." type="select-patient" />;
    }
    
    const viz = allVisualizations[visualizationType];
    if (!viz) return <Placeholder message="Invalid visualization" type="error" />;

    const Component = viz.component;
    const isExpanded = expandedChart === windowId;
    const navigation = chartNavigation[visualizationType];
    
    return <Component 
      patientId={patientId} 
      viewMode="physician"
      isExpanded={isExpanded}
      onExpand={() => handleExpand(windowId)}
      navigation={navigation}
      screenshotMode={screenshotMode}
    />;
  };

  const patientInfo = data?.patientInfo;

  return (
    <div className="physician-dashboard">
      {!screenshotMode && (
        <div className="physician-header">
          <h1>Physician Dashboard</h1>
        </div>
      )}

      {patientId && (
        <div className="dashboard-content">
          {!screenshotMode && (
            <div className="physician-sidebar">
              <PatientInfoCard 
                patientInfo={patientInfo}
                loading={loading}
                error={error}
                variant="physician"
                className="patient-info-card-physician"
              />
              
              <div className="qr-code-section">
                <h3>Patient Dashboard Access</h3>
                <p>Scan to access patient view</p>
                <img 
                  src={`${process.env.PUBLIC_URL}/Public_dashboard_QR_code.png`}
                  alt="QR Code for PGHD Dashboard"
                  className="qr-code-image"
                />
              </div>
            </div>
          )}

          <DashboardGrid
            viewMode="physician"
            selectedVisualizations={selectedVisualizations}
            availableVisualizations={availableVisualizations}
            allVisualizations={allVisualizations}
            onVisualizationChange={handleVisualizationChange}
            onExpand={handleExpand}
            expandedItem={expandedChart}
            renderVisualization={renderVisualizationWithMode}
            chartNavigation={chartNavigation}
            disabled={Object.keys(availableVisualizations).length === 0}
            placeholderText="No data available for this patient."
            screenshotMode={screenshotMode}
          />
        </div>
      )}
    </div>
  );
};

export default PhysicianDashboard;
