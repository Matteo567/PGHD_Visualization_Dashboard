/**
 InfoBox.js - Information Display Component
 
 A simple, reusable component for displaying informational content:
 - Supports title and content sections
 - Customizable styling through className prop
 - Used for patient education and data summaries
 - Lightweight component for consistent information presentation
 
 Provides standardized formatting for informational content across the application.
 */

import React from 'react';
import './InfoBox.css';

const InfoBox = ({ title, content, className = '' }) => {
  return (
    <div className={`info-box ${className}`}>
      {title && <h4 className="info-box-title">{title}</h4>}
      <div className="info-box-content">
        {content}
      </div>
    </div>
  );
};

export default InfoBox;
