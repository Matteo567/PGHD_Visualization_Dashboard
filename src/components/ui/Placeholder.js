/*
 Placeholder.js - Shared Placeholder Component
 
 This component provides consistent placeholder styling for:
 - No data scenarios
 - Loading states
 - Error states
 - Empty chart containers
 
 Replaces redundant chart-placeholder divs throughout the application
 with a unified, maintainable component.
 */

import React from 'react';
import './Placeholder.css';

/*
 Universal placeholder component for consistent styling
 
 @param {string} message - The placeholder message to display
 @param {string} type - The type of placeholder ('no-data', 'loading', 'error', 'select-patient')
 @param {string} className - Additional CSS classes
 @returns {JSX.Element} The placeholder component
 */
const Placeholder = ({ message, type = 'no-data', className = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <div className="placeholder-spinner"></div>;
      case 'error':
        return <div className="placeholder-icon error">!</div>;
      case 'select-patient':
        return <div className="placeholder-icon info">👤</div>;
      default:
        return <div className="placeholder-icon no-data">—</div>;
    }
  };

  return (
    <div className={`placeholder ${type} ${className}`}>
      {getIcon()}
      <p className="placeholder-message">{message}</p>
    </div>
  );
};

export default Placeholder;
