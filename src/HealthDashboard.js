/*
 HealthDashboard.js - Unified Health Dashboard Component
 
 This component provides a unified health dashboard designed for use by both patients and healthcare providers. It displays patient information with QR code access and shows week summaries for health tracking. It includes a toggle for 3-month summaries for long-term trend analysis. Exercise visualization includes both activity breakdown and weekly goals. The component uses custom hooks for data management, visualization handling, and navigation. It implements expandable chart views and provides educational information for patients. It handles loading and error states and includes summary statistics for health monitoring. The component displays patient demographics and medication information through PatientInfoCard. The QR code section provides access to the patient dashboard. The summary toggle controls visibility of 3-month summaries. DashboardGrid renders the chart grid with navigation and expansion controls. Individual chart components handle each health metric. State management uses custom hooks for centralized state, handles chart expansion state, manages navigation state for each chart type independently, and controls summary visibility with toggle state.
 */

import React, { useState } from 'react';
import usePatientData from './hooks/usePatientData';
import useVisualizations from './hooks/useVisualizations';
import useChartNavigation from './hooks/useChartNavigation';
import useDashboardState from './hooks/useDashboardState';
import PatientInfoCard from './components/PatientInfoCard';
import DashboardGrid from './components/DashboardGrid';
import Switch from './components/ui/Switch';
import Placeholder from './components/ui/Placeholder';
import './HealthDashboard.css';

const HealthDashboard = ({ patientId, accessType = 'Admin', screenshotMode = false }) => {
  const [condensedView, setCondensedView] = useState(false);
  const { data, loading, error } = usePatientData(patientId);
  const { 
    allVisualizations, 
    availableVisualizations: allAvailableVisualizations
  } = useVisualizations(data);
  
  // Filter visualizations based on access type
  // Physicians do not see meal contents chart
  let availableVisualizations = { ...allAvailableVisualizations };
  if (accessType === 'Physician') {
    const { mealContents, ...rest } = availableVisualizations;
    availableVisualizations = rest;
  }
  
  // Use dashboard state for chart expansion and summary toggles
  const {
    expandedChart,
    showThreeMonthSummaries,
    toggleChart,
    toggleThreeMonthSummaries
  } = useDashboardState();

  // Create navigation for each chart type
  // Most charts use week navigation while mood uses month navigation
  const weekNavigation = useChartNavigation('glucose'); // Week-based
  const monthNavigation = useChartNavigation('mood');   // Month-based
  
  const chartNavigation = {
    glucose: weekNavigation,
    bloodPressure: weekNavigation,
    exercise: weekNavigation,
    sleep: weekNavigation,
    pain: weekNavigation,
    mood: monthNavigation,      // Mood uses month navigation
    mealContents: weekNavigation
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
      accessType={accessType}
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
      {!screenshotMode && !condensedView && (
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

      {!screenshotMode && (
        <div className="condensed-view-control">
          <button
            onClick={() => setCondensedView(!condensedView)}
            className="condensed-view-button"
            aria-label={condensedView ? 'Show full view' : 'Enable condensed view'}
          >
            {condensedView ? 'Show Full View' : 'Condensed View'}
          </button>
        </div>
      )}

      <DashboardGrid
        viewMode="unified"
        availableVisualizations={availableVisualizations}
        allVisualizations={allVisualizations}
        onExpand={toggleChart}
        expandedItem={expandedChart}
        renderVisualization={renderVisualizationWithMode}
        chartNavigation={chartNavigation}
        screenshotMode={screenshotMode}
        condensedView={condensedView}
      />
    </div>
  );
};

export default HealthDashboard;
