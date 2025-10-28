/**
 * PatientInfoCard.js - Patient Information Display Component
 * 
 * This component displays comprehensive patient information:
 * - Basic demographics (name, age, gender, patient number)
 * - Medical conditions and diagnoses
 * - Current medications with dosage and schedule information
 * - Adapts display detail based on view mode (patient vs physician)
 * - Handles loading, error, and empty data states
 * 
 * Provides essential patient context for both dashboard views.
 */

import React from 'react';
import './PatientInfoCard.css';

/**
 * Shared component for displaying patient information
 * Used in both Patient and Physician dashboards
 */
const PatientInfoCard = ({ 
  patientInfo, 
  loading = false, 
  error = null, 
  variant = 'patient', // 'patient' or 'physician'
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`patient-info-card ${variant} ${className}`}>
        <h3>Patient Information</h3>
        <p>Loading patient info...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`patient-info-card ${variant} ${className}`}>
        <h3>Patient Information</h3>
        <p>Error loading data.</p>
      </div>
    );
  }

  if (!patientInfo) {
    return (
      <div className={`patient-info-card ${variant} ${className}`}>
        <h3>Patient Information</h3>
        <p>No patient data found.</p>
      </div>
    );
  }

  return (
    <div className={`patient-info-card ${variant} ${className}`}>
      <h3>Patient Information</h3>
      <div className="patient-info-grid">
        <div className="patient-basic-info">
          <h4>Patient Details</h4>
          <div><span>Name:</span> {patientInfo.name}</div>
          <div><span>Patient #:</span> {patientInfo.patientNumber}</div>
          <div><span>Age:</span> {patientInfo.age} years</div>
          <div><span>Gender:</span> {patientInfo.gender || 'Not specified'}</div>
        </div>
        
        <div className="conditions-section">
          <h4>Conditions</h4>
          {patientInfo.conditions?.length ? (
            <div className="conditions-list">
              {patientInfo.conditions.map((condition, i) => (
                <div key={i} className="condition-item">{condition}</div>
              ))}
            </div>
          ) : (
            <span>No conditions recorded.</span>
          )}
        </div>

        <div className="medications-section">
          <h4>Medications</h4>
          {patientInfo.detailedMedications?.length ? (
            <div className="medications-list">
              {variant === 'patient' ? (
                // Detailed view for patient dashboard
                patientInfo.detailedMedications.map((med, i) => (
                  <div key={i} className="medication-item">
                    <div className="medication-name">{med.name}</div>
                    <div className="medication-details">
                      <span className="medication-schedule">{med.schedule}</span>
                    </div>
                    {med.dosage && <div className="medication-dosage">{med.dosage}</div>}
                  </div>
                ))
              ) : (
                // Simplified view for physician dashboard
                patientInfo.detailedMedications.map((med, i) => (
                  <div key={i} className="medication-item">{med.name}</div>
                ))
              )}
            </div>
          ) : (
            <span>No medications recorded.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;
