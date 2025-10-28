/*
 PatientDashboard.js - Patient View Dashboard Component
 
 This component renders the patient-focused dashboard view with patient information,
 chart navigation controls, expandable chart views, and integration with all health
 metric visualizations.
 
 Architecture:
 - Uses custom hooks for data management, visualization handling, and navigation
 - Implements expandable chart views
 - Provides educational information for patients
 - Handles loading and error states gracefully
 
 Custom Hooks Used:
 - usePatientData: Manages patient data fetching and caching
 - useVisualizations: Handles visualization configuration and availability
 - useVisualizationHelpers: Provides chart expansion and rendering utilities
 - useChartNavigation: Manages time-based navigation for each chart type
 
 Component Structure:
 - PatientInfoCard: Displays patient demographics and medication information
 - DashboardGrid: Renders the chart grid with navigation and expansion controls
 - Individual chart components for each health metric
 
 State Management:
 - Uses custom hooks for centralized state management
 - Handles chart expansion state through useVisualizationHelpers
 - Manages navigation state for each chart type independently
 */

import React, { useState } from 'react';
import usePatientData from './hooks/usePatientData';
import useVisualizations from './hooks/useVisualizations';
import useChartNavigation from './hooks/useChartNavigation';
import PatientInfoCard from './components/PatientInfoCard';
import DashboardGrid from './components/DashboardGrid';
import Placeholder from './components/ui/Placeholder';
import './PatientDashboard.css';

const PatientDashboard = ({ patientId, screenshotMode = false }) => {
  const { data, loading, error } = usePatientData(patientId);
  const { 
    allVisualizations, 
    availableVisualizations, 
    selectedVisualizations, 
    handleVisualizationChange 
  } = useVisualizations('patient', data);
  
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
  const renderVisualizationWithMode = (visualizationType, boxId) => {
    if (!patientId) {
      return <Placeholder message="Please select a patient to view data." type="select-patient" />;
    }
    
    const viz = allVisualizations[visualizationType];
    if (!viz) {
      return <Placeholder message="Invalid visualization" type="error" />;
    }

    const Component = viz.component;
    const isExpanded = expandedChart === boxId;
    const navigation = chartNavigation[visualizationType];
    
    return <Component 
      patientId={patientId} 
      isExpanded={isExpanded} 
      onExpand={() => handleExpand(boxId)}
      viewMode="patient"
      navigation={navigation}
      screenshotMode={screenshotMode}
    />;
  };

  const patientInfo = data?.patientInfo;

  if (loading) return <div className="loading-screen">Loading patient data...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  return (
    <div className="patient-dashboard">
      {!screenshotMode && (
        <PatientInfoCard 
          patientInfo={patientInfo}
          loading={loading}
          error={error}
          variant="patient"
        />
      )}

      <DashboardGrid
        viewMode="patient"
        selectedVisualizations={selectedVisualizations}
        availableVisualizations={availableVisualizations}
        allVisualizations={allVisualizations}
        onVisualizationChange={handleVisualizationChange}
        onExpand={handleExpand}
        expandedItem={expandedChart}
        renderVisualization={renderVisualizationWithMode}
        chartNavigation={chartNavigation}
        screenshotMode={screenshotMode}
      />
    </div>
  );
};

export default PatientDashboard;
