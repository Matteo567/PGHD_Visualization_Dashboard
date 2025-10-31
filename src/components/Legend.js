/*
 Legend.js - Dynamic Chart Legend Component
 
 This component provides interactive legends for chart visualizations. It auto-sizes to fit chart container dimensions and supports horizontal and vertical orientations. It dynamically positions based on chart type and container and handles sizing for different chart contexts. It provides consistent legend formatting across all chart types. This component is used for interpreting chart data and color coding in health visualizations.
 */

import React, { useRef, useEffect, useState } from 'react';
import './ChartStyles.css';

const Legend = ({ 
  title, 
  items, 
  orientation = 'horizontal', // horizontal | vertical
  size = 'medium', // small | medium | large
  hide = false // Hide legend in screenshot mode
}) => {
  const legendRef = useRef(null);
  const [parentWidth, setParentWidth] = useState(null);

  useEffect(() => {
    const updateWidth = () => {
      if (!legendRef.current) return;

      // Simplified container finding - try multiple selector strategies in order
      const containerSelectors = [
        // Direct chart wrappers (most specific)
        '.glucose-chart-wrapper, .chart-section, .bp-svg-container, .exercise-chart-content, .sleep-chart, .pain-chart-wrapper, .meal-chart-wrapper, .mood-calendar-wrapper, .pain-line-chart-container',
        // Chart containers
        '.glucose-chart-container, .bp-chart-container, .exercise-chart-container, .sleep-chart-content, .pain-chart-container, .meal-contents-chart-container, .mood-calendar-container',
        // Final fallback
        '.visualization-content'
      ];

      let containerWidth = 0;

      // Find the first matching container
      for (const selector of containerSelectors) {
        const container = legendRef.current.closest(selector);
        if (container) {
          const computedStyle = window.getComputedStyle(container);
          const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
          const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
          containerWidth = container.offsetWidth - paddingLeft - paddingRight;
          break;
        }
      }

      // Special case for pain chart - check for inner wrapper
      if (!containerWidth && legendRef.current.closest('.pain-chart-container')) {
        const painWrapper = legendRef.current.closest('.pain-chart-container')?.querySelector('.pain-chart-wrapper');
        if (painWrapper) {
          const computedStyle = window.getComputedStyle(painWrapper);
          const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
          const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
          containerWidth = painWrapper.offsetWidth - paddingLeft - paddingRight;
        }
      }

      if (containerWidth > 0) {
        // Add margin and ensure minimum width
        const adjustedWidth = Math.max(containerWidth - 32, 200);
        setParentWidth(adjustedWidth);
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

  // Use parent width if available
  const containerStyle = parentWidth ? { width: parentWidth, maxWidth: parentWidth } : {};

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
