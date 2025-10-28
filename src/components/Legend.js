/*
 Legend.js - Dynamic Chart Legend Component
 
 This component provides interactive legends for chart visualizations:
 - Auto-sizes to fit chart container dimensions
 - Supports horizontal and vertical orientations
 - Dynamically positions based on chart type and container
 - Handles sizing for different chart contexts
 - Provides consistent legend formatting across all chart types
 
 Essential for interpreting chart data and color coding in health visualizations.
 */

import React, { useRef, useEffect, useState } from 'react';
import './ChartStyles.css';

const Legend = ({ 
  title, 
  items, 
  orientation = 'horizontal', // horizontal | vertical
  size = 'medium', // small | medium | large
  containerWidth = null, // Keep for backward compatibility, but will be overridden by auto-sizing
  hide = false // Hide legend in screenshot mode
}) => {
  const legendRef = useRef(null);
  const [parentWidth, setParentWidth] = useState(null);

  useEffect(() => {
    const updateWidth = () => {
      if (legendRef.current) {
        // Find the most specific chart content container (not the wrapper)
        const specificContainers = [
          '.glucose-chart-wrapper', // Glucose chart wrapper (contains the actual chart)
          '.chart-section', // Blood pressure chart sections
          '.bp-svg-container', // Blood pressure SVG container
          '.exercise-chart-content', // Exercise chart content
          '.sleep-chart', // Sleep chart container
          '.pain-chart-wrapper', // Pain chart wrapper
          '.meal-chart-wrapper', // Meal chart wrapper
          '.mood-calendar-wrapper', // Mood calendar wrapper
          '.pain-line-chart-container', // Pain line chart container
        ];
        
        let parentContainer = null;
        let containerWidth = 0;
        
        // Try to find the most specific container first
        for (const selector of specificContainers) {
          const container = legendRef.current.closest(selector);
          if (container) {
            parentContainer = container;
            // Get the content width excluding padding
            const computedStyle = window.getComputedStyle(container);
            const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
            containerWidth = container.offsetWidth - paddingLeft - paddingRight;
            break;
          }
        }
        
        // Special handling for pain legends - prioritize pain-chart-wrapper
        if (!parentContainer && legendRef.current.closest('.pain-legend-wrapper')) {
          const painChartWrapper = legendRef.current.closest('.pain-chart-container')?.querySelector('.pain-chart-wrapper');
          if (painChartWrapper) {
            parentContainer = painChartWrapper;
            const computedStyle = window.getComputedStyle(painChartWrapper);
            const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
            containerWidth = painChartWrapper.offsetWidth - paddingLeft - paddingRight;
          }
        }
        
        // Fallback to chart-specific containers if no specific one found
        if (!parentContainer) {
          const chartContainers = [
            '.glucose-chart-container',
            '.bp-chart-container', // Changed from .bp-chart-content to .bp-chart-container
            '.exercise-chart-container',
            '.sleep-chart-content',
            '.pain-chart-container',
            '.meal-contents-chart-container',
            '.mood-calendar-container'
          ];
          
          for (const selector of chartContainers) {
            const container = legendRef.current.closest(selector);
            if (container) {
              parentContainer = container;
              // For chart containers, find the inner chart content
              const innerChart = container.querySelector('.glucose-chart-wrapper, .chart-section, .bp-svg-container, .exercise-chart-content, .sleep-chart, .pain-chart-wrapper, .meal-chart-wrapper, .mood-calendar-wrapper');
              
              if (innerChart) {
                // Use the inner chart width
                const computedStyle = window.getComputedStyle(innerChart);
                const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
                const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
                containerWidth = innerChart.offsetWidth - paddingLeft - paddingRight;
              } else {
                // Fallback to container width with padding subtraction
                const computedStyle = window.getComputedStyle(container);
                const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
                const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
                containerWidth = container.offsetWidth - paddingLeft - paddingRight;
              }
              break;
            }
          }
        }
        
        // Final fallback to visualization content
        if (!parentContainer) {
          const vizContent = legendRef.current.closest('.visualization-content');
          if (vizContent) {
            parentContainer = vizContent;
            const computedStyle = window.getComputedStyle(vizContent);
            const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
            containerWidth = vizContent.offsetWidth - paddingLeft - paddingRight;
          }
        }
        
        if (parentContainer && containerWidth > 0) {
          // Add additional margin to prevent touching borders
          const adjustedWidth = Math.max(containerWidth - 32, 200); // Ensure minimum width of 200px
          setParentWidth(adjustedWidth);
        }
      }
    };

    updateWidth();
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateWidth);
    if (legendRef.current) {
      resizeObserver.observe(legendRef.current);
    }

    // Also listen for window resize as fallback
    window.addEventListener('resize', updateWidth);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  if (!items || items.length === 0 || hide) {
    return null;
  }

  // Use parent width if available, otherwise fall back to containerWidth prop or default
  const finalWidth = parentWidth || containerWidth;
  const containerStyle = finalWidth ? { width: finalWidth, maxWidth: finalWidth } : {};

  return (
    <div 
      ref={legendRef}
      className={`legend-container legend-${orientation} legend-${size}`}
      style={containerStyle}
    >
      {title && <h4 className="legend-title">{title}</h4>}
      <div className="legend-items">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="legend-item" 
            style={item.style}
            title={item.description || item.label}
          >
            {/* Color indicator */}
            {item.color && (
              <span 
                className="legend-color-indicator" 
                style={{ backgroundColor: item.color }}
                aria-label={`Color indicator for ${item.label}`}
              />
            )}
            
            {/* Icon/emoji indicator */}
            {item.icon && (
              <span 
                className="legend-icon"
                aria-label={`Icon for ${item.label}`}
              >
                {item.icon}
              </span>
            )}
            
            {/* Shape indicator for special cases */}
            {item.shape && (
              <span 
                className={`legend-shape legend-shape-${item.shape}`}
                style={item.shapeStyle}
                aria-label={`${item.shape} indicator for ${item.label}`}
              />
            )}
            
            {/* Label */}
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
