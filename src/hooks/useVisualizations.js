// Hook for managing visualization components and determining which visualizations have available data
import { VISUALIZATION_CONFIG } from '../constants';
import GlucoseChart from '../components/patient_charts/GlucoseChart';
import BloodPressureChart from '../components/patient_charts/BloodPressureChart';
import ExerciseChart from '../components/patient_charts/ExerciseChart';
import MoodCalendar from '../components/patient_charts/MoodCalendar';
import PainChart from '../components/patient_charts/PainChart';
import MealContentsChart from '../components/patient_charts/MealContentsChart';
import SleepChart from '../components/patient_charts/SleepChart';
const useVisualizations = (data) => {
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

  // Find which visualizations have data available
  const availableVisualizations = {};
  if (data) {
    const vizKeys = Object.keys(allVisualizations);
    for (let i = 0; i < vizKeys.length; i++) {
      const key = vizKeys[i];
      const viz = allVisualizations[key];
      
      // Special case for meal contents
      if (key === 'mealContents') {
        if (data['mealData'] && data['mealData'].length > 0) {
          availableVisualizations[key] = viz;
        }
      } else {
        // For other charts, check for matching data key (e.g., glucoseData for glucose chart)
        const dataKey = `${key}Data`;
        if (data[dataKey] && data[dataKey].length > 0) {
          availableVisualizations[key] = viz;
        }
      }
    }
  }

  return {
    allVisualizations,
    availableVisualizations
  };
};

export default useVisualizations;
