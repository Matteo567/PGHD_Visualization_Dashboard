/*
 constants/index.js - Application Configuration and Constants
 
 This file contains all application-wide constants and configurations including
 patient ID generation and management, chart color schemes and visual configurations,
 visualization component mappings, dashboard layout configurations, and application-wide
 settings and defaults.
 
 Architecture:
 - Centralized configuration management
 - Consistent color scheme across all visualizations
 - Scalable patient ID generation system
 - Flexible dashboard configuration system
 
 Color Scheme:
 - Uses colorblind-friendly color palette
 - Consistent color mapping across chart types
 - Semantic color associations (green for good, red for danger, etc.)
 - Accessibility-compliant contrast ratios
 
 Patient Management:
 - Supports 100 synthetic patients
 - Consistent ID formatting (Patient_001 to Patient_100)
 - Scalable for additional patient data
 
 Visualization Configuration:
 - Maps visualization types to display names and colors
 - Supports both patient and physician dashboard modes
 - Configurable chart limits and layouts
 */

// Application constants
export const PATIENT_COUNT = 100;

// Generate patient IDs array
export const PATIENTS = Array.from({ length: PATIENT_COUNT }, (_, i) => 
  `Patient_${(i + 1).toString().padStart(3, '0')}`
);

// Chart color scheme - Updated for colorblind accessibility
// Note: Title colors are now hardcoded to black, these colors are used for chart elements
export const CHART_COLORS = {
  glucose: '#1b9e77', // Green - represents healthy glucose levels
  bloodPressure: '#1f78b4', // Blue - represents stable blood pressure
  exercise: '#1f78b4', // Blue - represents physical activity
  mood: '#d95f02', // Orange - represents emotional states
  pain: '#fec44f', // Orange - represents pain intensity (moderate level)
  mealContents: '#27ae60', // Green - represents healthy nutrition
  sleep: '#a6cee3' // Light blue - represents restful sleep
};

// Visualization configurations - Updated with consistent naming and no emojis
export const VISUALIZATION_CONFIG = {
  glucose: { name: 'Blood Glucose' },
  bloodPressure: { name: 'Blood Pressure' },
  exercise: { name: 'Exercise' },
  mood: { name: 'Mood' },
  pain: { name: 'Pain' },
  mealContents: { name: 'Meal Contents' },
  sleep: { name: 'Sleep' }
};
