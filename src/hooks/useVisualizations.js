/*
 useVisualizations.js - Visualization Management Hook
 
 This hook manages the visualization system across dashboard types by creating and
 maintaining visualization component registry, determining available visualizations
 based on data availability, managing visualization selection and ordering, and
 supporting both patient and physician dashboard configurations.
 
 Architecture:
 - Uses React hooks for state management and memoization
 - Implements component registry pattern for dynamic rendering
 - Provides data-driven visualization availability
 - Supports multiple dashboard configurations
 
 Visualization Types:
 - glucose: Blood glucose monitoring charts
 - bloodPressure: Blood pressure tracking charts
 - exercise: Physical activity visualization
 - mood: Mood calendar and tracking
 - pain: Pain reporting with body mapping
 - mealContents: Nutritional intake tracking
 - sleep: Sleep pattern analysis
 
 Component Registry:
 - Maps visualization types to React components
 - Provides configuration for each visualization type
 - Handles component imports and lazy loading
 - Maintains consistent component interfaces
 
 Data Availability:
 - Checks data availability for each visualization type
 - Filters visualizations based on actual data presence
 - Provides fallback for missing data scenarios
 - Ensures only relevant visualizations are shown
 */

import React from 'react';
import { VISUALIZATION_CONFIG, DASHBOARD_CONFIG } from '../constants';

// Import all chart components
import GlucoseChart from '../components/patient_charts/GlucoseChart';
import BloodPressureChart from '../components/patient_charts/BloodPressureChart';
import ExerciseChart from '../components/patient_charts/ExerciseChart';
import MoodCalendar from '../components/patient_charts/MoodCalendar';
import PainChart from '../components/patient_charts/PainChart';
import MealContentsChart from '../components/patient_charts/MealContentsChart';
import SleepChart from '../components/patient_charts/SleepChart';

/*
 Simple hook for managing visualizations
 */
const useVisualizations = (viewMode, data) => {
  const config = DASHBOARD_CONFIG[viewMode];
  
  // All available visualization types with their components
  const allVisualizations = {
    pain: { ...VISUALIZATION_CONFIG.pain, component: PainChart },
    bloodPressure: { ...VISUALIZATION_CONFIG.bloodPressure, component: BloodPressureChart },
    glucose: { ...VISUALIZATION_CONFIG.glucose, component: GlucoseChart },
    exercise: { ...VISUALIZATION_CONFIG.exercise, component: ExerciseChart },
    mealContents: { ...VISUALIZATION_CONFIG.mealContents, component: MealContentsChart },
    mood: { ...VISUALIZATION_CONFIG.mood, component: MoodCalendar },
    sleep: { ...VISUALIZATION_CONFIG.sleep, component: SleepChart },
  };

  // Determine which visualizations have data available
  const availableVisualizations = {};
  if (data) {
    const vizKeys = Object.keys(allVisualizations);
    for (let i = 0; i < vizKeys.length; i++) {
      const key = vizKeys[i];
      const viz = allVisualizations[key];
      const dataKey = `${key}Data`;
      
      // Special case for meal contents
      if (key === 'mealContents' && data['mealData'] && data['mealData'].length > 0) {
        availableVisualizations[key] = viz;
      } else if (data[dataKey] && data[dataKey].length > 0) {
        availableVisualizations[key] = viz;
      }
    }
  }

  // Create selected visualizations mapping
  const availableKeys = Object.keys(availableVisualizations);
  const selectedVisualizations = {};
  for (let i = 0; i < availableKeys.length; i++) {
    const chartId = `${viewMode}-chart-${i}`;
    selectedVisualizations[chartId] = availableKeys[i];
  }

  const handleVisualizationChange = (chartId, visualizationType) => {
    // Visualization changes are handled automatically by showing all available visualizations
    // This function is kept for API compatibility but is not actively used
  };

  return {
    allVisualizations,
    availableVisualizations,
    selectedVisualizations,
    handleVisualizationChange,
    config
  };
};

export default useVisualizations;
