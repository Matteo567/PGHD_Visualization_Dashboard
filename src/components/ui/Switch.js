import React from 'react';
import './Switch.css';

const Switch = ({ 
  checked, 
  onChange, 
  leftLabel = 'Patient View', 
  rightLabel = 'Physician View',
  className = '',
  disabled = false 
}) => {
  return (
    <div className={`switch-container ${className}`}>
      <span className={`switch-label ${!checked ? 'active' : ''}`}>
        {leftLabel}
      </span>
      
      <button
        type="button"
        className={`switch-button ${checked ? 'checked' : ''}`}
        onClick={onChange}
        disabled={disabled}
        aria-label="Toggle between patient and physician view"
        aria-pressed={checked}
      >
        <div className="switch-indicator"></div>
      </button>
      
      <span className={`switch-label ${checked ? 'active' : ''}`}>
        {rightLabel}
      </span>
    </div>
  );
};

export default Switch;
