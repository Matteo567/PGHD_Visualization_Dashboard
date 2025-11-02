/**
 DashboardGrid.js - Chart Grid Layout Component
 
 This component provides a flexible grid layout system for organizing charts. It renders all available visualizations in a grid and handles expanded and collapsed chart states. It integrates chart navigation controls and provides placeholder states for empty data scenarios. This component acts as the main container for organizing multiple health metric visualizations.
 */

import React from 'react';
import VisualizationWrapper from './VisualizationWrapper';
import Placeholder from './ui/Placeholder';
import './DashboardGrid.css';

/*
 Shared component for rendering dashboard grids with visualization wrappers. Shows all available visualizations instead of using dropdown selectors. The component handles view mode which currently only supports 'unified'. It manages available visualizations and all visualization configurations. It provides handlers for expand and collapse operations and tracks the currently expanded item ID. It includes a function to render visualizations and displays placeholder text when no data is available. It integrates navigation objects for each chart type and supports screenshot mode.
 */
const DashboardGrid = ({
  viewMode = 'unified', // View mode (defaults to 'unified')
  availableVisualizations,
  allVisualizations,
  onExpand,
  expandedItem,
  renderVisualization,
  placeholderText = "No data available for this patient.",
  // Navigation props
  chartNavigation = {},
  // Screenshot mode
  screenshotMode = false,
  // Condensed view mode
  condensedView = false
}) => {
  // Configuration for view mode (only 'unified' is currently used)
  const gridConfig = {
    unified: {
      className: 'dashboard-grid',
      chartClassNames: ['visualization-box']
    }
  };

  const config = gridConfig[viewMode] || gridConfig.unified; // Fallback to unified if unknown mode

  // Get all available visualization types
  const availableVizTypes = Object.keys(availableVisualizations);

  // If there's an expanded item, show only that chart in expanded view
  if (expandedItem) {
    // Extract the chart index from the chart ID (format: "viewMode-chart-index")
    const chartIdParts = expandedItem.split('-');
    const chartIndex = parseInt(chartIdParts[chartIdParts.length - 1]);
    const selectedViz = availableVizTypes[chartIndex];
    
    if (!selectedViz) {
      return (
        <div className={config.className}>
          <Placeholder message="Invalid expanded chart" type="error" />
        </div>
      );
    }
    
    const navigation = chartNavigation[selectedViz];
    
    return (
      <VisualizationWrapper
        id={expandedItem}
        className={`${config.chartClassNames[0]} expanded-view`}
        selectedViz={selectedViz}
        availableVisualizations={availableVisualizations}
        allVisualizations={allVisualizations}
        onExpand={onExpand}
        isExpanded={true}
        renderVisualization={renderVisualization}
        placeholderText={placeholderText}
        onPrev={navigation?.goToPrevious}
        onNext={navigation?.goToNext}
        navigationLabel={navigation?.navigationLabel || 'Week'}
        screenshotMode={screenshotMode}
        condensedView={condensedView}
      />
    );
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
          onExpand: onExpand,
          isExpanded: expandedItem === chartId,
          renderVisualization: renderVisualization,
          placeholderText: placeholderText,
          onPrev: navigation?.goToPrevious,
          onNext: navigation?.goToNext,
          navigationLabel: navigation?.navigationLabel || 'Week',
          screenshotMode: screenshotMode,
          condensedView: condensedView
        };

        return <VisualizationWrapper {...wrapperProps} />;
      })}
    </div>
  );
};

export default DashboardGrid;
