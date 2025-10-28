/**
 LoadingSpinner.js - Loading State Indicator Component
 
 A customizable loading spinner component that provides:
 - Visual feedback during data loading operations
 - Multiple size variants (small, medium, large)
 - Customizable loading messages
 - Consistent loading state presentation
 - PropTypes validation for component props
 
 Used throughout the application to indicate when data is being fetched or processed.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/*
 Loading spinner component with customizable message and size
 
 @param {Object} props
 @param {string} props.message - Loading message to display
 @param {string} props.size - Size variant: 'small', 'medium', 'large'
 */
function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'medium' 
}) {
  return (
    <div className={`loading-container ${size}`}>
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default LoadingSpinner;
