/*
 HealthDashboard.js - Unified Health Dashboard Component
 
 This component provides a unified health dashboard that combines the best features
 from both patient and physician dashboards. It's designed to be used by both
 patients and healthcare providers with a clean, accessible interface.
 
 Features:
 - Patient information display with QR code access
 - Week summaries always visible for better health tracking
 - Toggle for 3-month summaries for long-term trend analysis
 - Exercise visualization with both activity breakdown and weekly goals
 - Clean, patient-friendly design with professional functionality
 - Screenshot mode support for documentation
 
 Architecture:
 - Uses custom hooks for data management, visualization handling, and navigation
 - Implements expandable chart views
 - Provides educational information for patients
 - Handles loading and error states gracefully
 - Includes summary statistics for comprehensive health monitoring
 
 Custom Hooks Used:
 - usePatientData: Manages patient data fetching and caching
 - useVisualizations: Handles visualization configuration and availability
 - useChartNavigation: Manages time-based navigation for each chart type
 
 Component Structure:
 - PatientInfoCard: Displays patient demographics and medication information
 - QR Code Section: Provides access to patient dashboard
 - Summary Toggle: Controls visibility of 3-month summaries
 - DashboardGrid: Renders the chart grid with navigation and expansion controls
 - Individual chart components for each health metric
 
 State Management:
 - Uses custom hooks for centralized state management
 - Handles chart expansion state
 - Manages navigation state for each chart type independently
 - Controls summary visibility with toggle state
 */

import React from 'react';
import usePatientData from './hooks/usePatientData';
import useVisualizations from './hooks/useVisualizations';
import useChartNavigation from './hooks/useChartNavigation';
import useDashboardState from './hooks/useDashboardState';
import PatientInfoCard from './components/PatientInfoCard';
import DashboardGrid from './components/DashboardGrid';
import Placeholder from './components/ui/Placeholder';
import Switch from './components/ui/Switch';
import './HealthDashboard.css';

const HealthDashboard = ({ patientId, screenshotMode = false }) => {
  const { data, loading, error } = usePatientData(patientId);
  const { 
    allVisualizations, 
    availableVisualizations, 
    selectedVisualizations, 
    handleVisualizationChange 
  } = useVisualizations('patient', data);
  
  // Use custom dashboard state hook
  const {
    expandedChart,
    showThreeMonthSummaries,
    toggleChart,
    toggleThreeMonthSummaries
  } = useDashboardState();

  // Navigation for all charts
  const sharedNavigation = useChartNavigation('glucose'); // Default to 'week' navigation

  const chartNavigation = {
    glucose: sharedNavigation,
    bloodPressure: sharedNavigation,
    exercise: sharedNavigation,
    sleep: sharedNavigation,
    pain: sharedNavigation,
    mood: sharedNavigation, // Now use shared weekly navigation
    mealContents: sharedNavigation
  };

  // Render visualization with unified view mode
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
      onExpand={() => toggleChart(boxId)}
      viewMode="unified" // New unified view mode
      navigation={navigation}
      screenshotMode={screenshotMode}
      showThreeMonthSummaries={showThreeMonthSummaries} // Pass summary toggle state
    />;
  };

  const patientInfo = data?.patientInfo;

  if (loading) return <div className="loading-screen">Loading patient data...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  return (
    <div className="health-dashboard">
      {!screenshotMode && (
        <div className="dashboard-header">
          <PatientInfoCard 
            patientInfo={patientInfo}
            loading={loading}
            error={error}
            variant="unified"
          />
          
          <div className="dashboard-controls">
            <div className="qr-code-section">
              <h3>Access Health Dashboard</h3>
              <p>Scan QR code for quick access</p>
              <img 
                src={`${process.env.PUBLIC_URL}/Public_dashboard_QR_code.png`}
                alt="QR Code for PGHD Dashboard"
                className="qr-code-image"
              />
            </div>
            
            <div className="summary-toggle-section">
              <h3>Summary Options</h3>
              <Switch
                checked={showThreeMonthSummaries}
                onChange={toggleThreeMonthSummaries}
                leftLabel="Week Only"
                rightLabel="Include 3-Month"
              />
              <p className="toggle-description">
                {showThreeMonthSummaries 
                  ? "Showing both week and 3-month summaries for comprehensive health tracking"
                  : "Showing week summaries only for focused current health monitoring"
                }
              </p>
            </div>
          </div>
        </div>
      )}

          <DashboardGrid
            viewMode="unified"
            selectedVisualizations={selectedVisualizations}
            availableVisualizations={availableVisualizations}
            allVisualizations={allVisualizations}
            onVisualizationChange={handleVisualizationChange}
            onExpand={toggleChart}
            expandedItem={expandedChart}
            renderVisualization={renderVisualizationWithMode}
            chartNavigation={chartNavigation}
            screenshotMode={screenshotMode}
          />
    </div>
  );
};

export default HealthDashboard;
