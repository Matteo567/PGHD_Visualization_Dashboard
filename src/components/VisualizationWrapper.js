/*
 - VisualizationWrapper.js - Universal Chart Container Component
 
 - This component provides a standardized wrapper for all chart visualizations by handling loading,
  error, and no-data states, providing chart navigation controls (previous/next), managing 
  expand/collapse functionality, displaying chart titles and controls, and ensuring consistent 
  chart presentation across the application.
 
 - Serves as the foundation for all health metric chart displays.
 */

import React from 'react';
import Placeholder from './ui/Placeholder';

/*
 - Shared component for visualization containers used in both Patient and Physician dashboards
 - Includes functionality previously in ChartContainer: navigation, loading states, error handling
 
 - @param {Object} props - Component props
 - @param {string} props.id - Unique identifier for the visualization
 - @param {string} props.className - CSS class names
 - @param {string} props.selectedViz - Selected visualization type
 - @param {Object} props.availableVisualizations - Available visualizations
 - @param {Object} props.allVisualizations - All visualization configurations
 - @param {Function} props.onVisualizationChange - Handler for visualization changes
 - @param {Function} props.onExpand - Handler for expand/collapse
 - @param {boolean} props.isExpanded - Whether the visualization is expanded
 - @param {Function} props.renderVisualization - Function to render the visualization
 - @param {boolean} props.disabled - Whether the visualization is disabled
 - @param {string} props.placeholderText - Text to show when no data is available
 - @param {string} props.title - Chart title
 - @param {boolean} props.isLoading - Whether the chart is loading
 - @param {string|null} props.error - Error message if any
 - @param {boolean} props.noData - Whether there's no data to display
 - @param {boolean} props.showNavigation - Whether to show navigation controls
 - @param {Function} props.onPrev - Previous navigation handler
 - @param {Function} props.onNext - Next navigation handler
 - @param {string} props.navigationLabel - Label for navigation controls
 - @returns {JSX.Element} The visualization wrapper component
 */
const VisualizationWrapper = ({ 
  id, 
  className, 
  selectedViz, 
  availableVisualizations, 
  allVisualizations,
  onVisualizationChange, 
  onExpand, 
  isExpanded, 
  renderVisualization,
  disabled = false,
  placeholderText = "No data available for this patient.",
  // ChartContainer props
  title,
  isLoading = false,
  error = null,
  noData = false,
  showNavigation = true,
  onPrev,
  onNext,
  navigationLabel = 'Week',
  // Screenshot mode
  screenshotMode = false
}) => {
  const viz = allVisualizations[selectedViz];
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className={`visualization-wrapper ${isExpanded ? 'expanded' : ''} ${className}`}>
        <Placeholder message="Loading data..." type="loading" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`visualization-wrapper ${isExpanded ? 'expanded' : ''} ${className}`}>
        <Placeholder message={`Error: ${error}`} type="error" />
      </div>
    );
  }

  // Handle no data state
  if (noData) {
    return (
      <div className={`visualization-wrapper ${isExpanded ? 'expanded' : ''} ${className}`}>
        <Placeholder message="No data available" type="no-data" />
      </div>
    );
  }
  
  return (
    <div className={`visualization-wrapper ${isExpanded ? 'expanded' : ''} ${className} ${screenshotMode ? 'screenshot-mode' : ''}`}>
      {!screenshotMode && (
        <div className="visualization-header">
          <div className="visualization-title-group">
            <h3 className="visualization-title">
              {title || viz?.name || 'Unknown Visualization'}
            </h3>
          </div>
          <div className="visualization-controls">
            {showNavigation && onPrev && onNext && (
              <div className="chart-navigation">
                <button 
                  className="nav-button prev" 
                  onClick={onPrev}
                  aria-label={`Previous ${navigationLabel}`}
                >
                  ‹
                </button>
                <button 
                  className="nav-button next" 
                  onClick={onNext}
                  aria-label={`Next ${navigationLabel}`}
                >
                  ›
                </button>
              </div>
            )}
            <button onClick={() => onExpand(id)} className="expand-button">
              {isExpanded ? 'Collapse' : 'Expand'}
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
