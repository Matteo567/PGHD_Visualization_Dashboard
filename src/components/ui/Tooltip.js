/**
 Tooltip.js - Interactive Chart Tooltip Component
 
 This component provides contextual information on chart hover:
 - Displays detailed data point information
 - Automatically positions tooltips within viewport boundaries
 - Handles cursor positioning and offset calculations
 - Supports dynamic content rendering
 - Ensures tooltips remain visible and accessible
 
 Enhances chart interactivity by providing detailed data context on hover.
 */

import React, { useState, useEffect } from 'react';
import './Tooltip.css';

const Tooltip = ({ 
  isVisible, 
  content, 
  position = { x: 0, y: 0 }
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isVisible) {
      // Use viewport coordinates directly
      let x = position.x;
      let y = position.y;
      
      // Adjust position to keep tooltip within viewport
      const tooltipWidth = 180; // Approximate tooltip width
      const tooltipHeight = 70; // Approximate tooltip height
      
      // Position tooltip closer to the cursor - slightly above and to the right
      x = x + 15; // Small offset to the right
      y = y - tooltipHeight - 5; // Position above the cursor with small gap
      
      // Adjust horizontal position if tooltip would go outside viewport
      if (x + tooltipWidth > window.innerWidth) {
        x = x - tooltipWidth - 30; // Move to the left of the cursor
      }
      
      // Adjust vertical position if tooltip would go outside viewport
      if (y < 0) {
        y = y + tooltipHeight + 20; // Move below the cursor
      }
      
      setTooltipPosition({ x, y });
    }
  }, [isVisible, position]);

  if (!isVisible) return null;

  return (
    <div 
      className="custom-tooltip"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }}
    >
      {content}
    </div>
  );
};

export default Tooltip;
