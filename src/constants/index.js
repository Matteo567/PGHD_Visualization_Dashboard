/*
 constants/index.js - Application Configuration and Constants
 
 This file contains all application wide constants and configurations including patient ID generation and management, visualization component mappings, dashboard layout configurations, and application wide settings and defaults. The file uses centralized configuration management with a scalable patient ID generation system and flexible dashboard configuration system. Patient management supports 100 synthetic patients configurable via PATIENT_COUNT with consistent ID formatting from Patient_001 to Patient_100 and is scalable for additional patient data. PATIENT_COUNT is an internal constant for the total number of patients. Visualization configuration maps visualization types to display names, supports both patient and physician dashboard modes, and provides configurable chart limits and layouts.
 */

// Application constants
const PATIENT_COUNT = 100; // Internal constant that is not exported

// Generate patient IDs array
export const PATIENTS = Array.from({ length: PATIENT_COUNT }, (_, i) => 
  `Patient_${(i + 1).toString().padStart(3, '0')}`
);

// Visualization configurations with consistent naming and without emojis
export const VISUALIZATION_CONFIG = {
  glucose: { name: 'Blood Glucose' },
  bloodPressure: { name: 'Blood Pressure' },
  exercise: { name: 'Exercise' },
  mood: { name: 'Mood' },
  pain: { name: 'Pain' },
  mealContents: { name: 'Meal Contents' },
  sleep: { name: 'Sleep' }
};
