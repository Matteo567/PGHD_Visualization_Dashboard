/**
 DashboardGrid.js - Chart Grid Layout Component
 
 This component provides a flexible grid layout system for organizing charts by rendering all 
 available visualizations in a grid, handling expanded/collapsed chart states, integrating chart 
 navigation controls, and providing placeholder states for empty data scenarios.
 
 Acts as the main container for organizing multiple health metric visualizations.
 */

import React from 'react';
import VisualizationWrapper from './VisualizationWrapper';
import Placeholder from './ui/Placeholder';
import './DashboardGrid.css';

/*
 Shared component for rendering dashboard grids with visualization wrappers
 Shows all available visualizations instead of using dropdown selectors
 
 @param {Object} props - Component props
 @param {string} props.viewMode - 'patient' or 'physician'
 @param {Object} props.selectedVisualizations - Currently selected visualizations
 @param {Object} props.availableVisualizations - Available visualizations
 @param {Object} props.allVisualizations - All visualization configurations
 @param {Function} props.onVisualizationChange - Handler for visualization changes
 @param {Function} props.onExpand - Handler for expand/collapse
 @param {string|null} props.expandedItem - Currently expanded item ID
 @param {Function} props.renderVisualization - Function to render visualizations
 @param {boolean} props.disabled - Whether the grid is disabled
 @param {string} props.placeholderText - Text to show when no data is available
 @param {boolean} props.showSummaries - Whether to show summaries (unused)
 @param {Object} props.summaryTexts - Summary texts (unused)
 @param {Function} props.onSummaryChange - Summary change handler (unused)
 @param {Object} props.chartNavigation - Navigation objects for each chart type
 @returns {JSX.Element} The dashboard grid component
 */
const DashboardGrid = ({
  viewMode, // 'patient' or 'physician'
  selectedVisualizations,
  availableVisualizations,
  allVisualizations,
  onVisualizationChange,
  onExpand,
  expandedItem,
  renderVisualization,
  disabled = false,
  placeholderText = "No data available for this patient.",
  // New props for physician summary functionality
  showSummaries = false,
  summaryTexts = {},
  onSummaryChange = null,
  // Navigation props
  chartNavigation = {},
  // Screenshot mode
  screenshotMode = false
}) => {
  // Configuration for different view modes
  const gridConfig = {
    patient: {
      className: 'dashboard-grid',
      chartClassNames: ['visualization-box']
    },
    physician: {
      className: 'physician-charts-grid',
      chartClassNames: ['physician-chart-container']
    }
  };

  const config = gridConfig[viewMode];

  // Get all available visualization types
  const availableVizTypes = Object.keys(availableVisualizations);

  // If there's an expanded item, show only that
  if (expandedItem) {
    const selectedViz = selectedVisualizations[expandedItem];
    const navigation = chartNavigation[selectedViz];
    
    const wrapperProps = {
      id: expandedItem,
      className: `${config.chartClassNames[0]} expanded-view`,
      selectedViz: selectedViz,
      availableVisualizations: availableVisualizations,
      allVisualizations: allVisualizations,
      onVisualizationChange: onVisualizationChange,
      onExpand: onExpand,
      isExpanded: true,
      renderVisualization: renderVisualization,
      disabled: disabled,
      placeholderText: placeholderText,
      onPrev: navigation?.goToPrevious,
      onNext: navigation?.goToNext,
      navigationLabel: navigation?.navigationLabel || 'Week',
      screenshotMode: screenshotMode
    };

    return <VisualizationWrapper {...wrapperProps} />;
  }

  // If no visualizations available, show placeholder
  if (availableVizTypes.length === 0) {
    return (
      <div className={config.className}>
        <Placeholder message={placeholderText} type="no-data" />
      </div>
    );
  }

  // Render all available visualizations
  return (
    <div className={config.className}>
      {availableVizTypes.map((vizType, index) => {
        const chartId = `${viewMode}-chart-${index}`;
        
        const navigation = chartNavigation[vizType];
        const wrapperProps = {
          key: chartId,
          id: chartId,
          className: `${config.chartClassNames[0]} ${config.chartClassNames[0]}-${index + 1}`,
          selectedViz: vizType,
          availableVisualizations: availableVisualizations,
          allVisualizations: allVisualizations,
          onVisualizationChange: onVisualizationChange,
          onExpand: onExpand,
          isExpanded: expandedItem === chartId,
          renderVisualization: renderVisualization,
          disabled: disabled,
          placeholderText: placeholderText,
          onPrev: navigation?.goToPrevious,
          onNext: navigation?.goToNext,
          navigationLabel: navigation?.navigationLabel || 'Week',
          screenshotMode: screenshotMode
        };

        return <VisualizationWrapper {...wrapperProps} />;
      })}
    </div>
  );
};

export default DashboardGrid;
