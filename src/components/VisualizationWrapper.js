/*
 VisualizationWrapper.js - Universal Chart Container Component
 
 This component provides a standardized wrapper for all chart visualizations. It handles loading, error, and no-data states. It provides chart navigation controls for previous and next navigation and manages expand and collapse functionality. It displays chart titles and controls and ensures consistent chart presentation across the application. This component serves as the foundation for all health metric chart displays.
 */

import React from 'react';
import Placeholder from './ui/Placeholder';

/*
 Shared component for visualization containers used in both Patient and Physician dashboards. Includes navigation, loading states, and error handling. The component accepts a unique identifier for the visualization, CSS class names, selected visualization type, available visualizations, and all visualization configurations. It provides handlers for expand and collapse operations and tracks whether the visualization is expanded. It includes a function to render the visualization and displays placeholder text when no data is available. It handles chart title display and provides previous and next navigation handlers. It supports navigation label customization and screenshot mode.
 */
const VisualizationWrapper = ({ 
  id, 
  className, 
  selectedViz, 
  availableVisualizations, 
  allVisualizations,
  onExpand, 
  isExpanded, 
  renderVisualization,
  placeholderText = "No data available for this patient.",
  // ChartContainer props
  title,
  onPrev,
  onNext,
  navigationLabel = 'Week',
  // Screenshot mode
  screenshotMode = false,
  // Condensed view mode
  condensedView = false
}) => {
  const viz = allVisualizations[selectedViz];
  
  return (
    <div className={`visualization-wrapper ${isExpanded ? 'expanded' : ''} ${className} ${screenshotMode ? 'screenshot-mode' : ''} ${condensedView ? 'condensed-view' : ''}`}>
      {!screenshotMode && !condensedView && (
        <div className="visualization-header">
          <div className="visualization-controls">
            {onPrev && onNext && (
              <div className="chart-navigation">
                <button 
                  className="nav-button prev" 
                  onClick={onPrev}
                  aria-label={`Previous ${navigationLabel}`}
                >
                  ⇦ prev week
                </button>
                <button 
                  className="nav-button next" 
                  onClick={onNext}
                  aria-label={`Next ${navigationLabel}`}
                >
                  next week ⇨
                </button>
              </div>
            )}
            <button onClick={() => onExpand(id)} className="expand-button">
              {isExpanded ? 'Minimize' : 'Expand'}
            </button>
          </div>
        </div>
      )}
      <div className="visualization-content">
        {Object.keys(availableVisualizations).length === 0 ? (
          <Placeholder message={placeholderText} type="no-data" />
        ) : (
          renderVisualization(selectedViz, id)
        )}
      </div>
    </div>
  );
};

export default VisualizationWrapper;
