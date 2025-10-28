/*
 dataService.js - Patient Data Service
 
 This service handles all data operations for the health dashboard:
 - Fetches patient CSV data from the server
 - Parses and processes CSV data using PapaParse
 - Transforms raw data into structured health metrics
 - Provides data validation and error handling
 - Manages patient information, medications, and health tracking data
 - Supports all health metric types (glucose, BP, exercise, mood, pain, sleep, meals)
 
 Architecture:
 - Uses PapaParse library for CSV parsing
 - Implements service class pattern for data operations
 - Provides comprehensive error handling and validation
 - Supports multiple data formats and structures
 
 Data Processing:
 - CSV parsing with header validation
 - Data transformation and normalization
 - Type conversion and validation
 - Error recovery and fallback mechanisms
 
 Health Metrics Supported:
 - Blood glucose monitoring with meal context
 - Blood pressure tracking with risk categorization
 - Exercise activity tracking and categorization
 - Mood assessment and tracking
 - Pain reporting with anatomical mapping
 - Sleep quality and duration analysis
 - Nutritional intake and meal composition
 
 Error Handling:
 - Network error recovery
 - CSV parsing error handling
 - Data validation and sanitization
 - Graceful degradation for missing data
 
 Core service for data management and processing throughout the application.
 */

import Papa from 'papaparse';

// Configuration for CSV parsing
const CSV_CONFIG = {
  header: true,
  skipEmptyLines: true,
  transformHeader: (header) => header.trim(),
  transform: (value) => value?.trim(),
};

/*
 Fetches and parses CSV data for a specific patient
 
 - @param {string} patientId - The patient identifier
 - @returns {Promise<Array>} Parsed CSV data as array of objects
 - @throws {Error} If CSV fetch or parsing fails
 */
const fetchPatientCsvData = async (patientId) => {
  try {
    // Add cache busting to ensure fresh data
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://matteo567.github.io/PGHD_Visualization_Dashboard' 
      : '';
    const response = await fetch(`${baseUrl}/synthetic_patients/${patientId}.csv?v=${Date.now()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV for ${patientId}: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error(`Empty CSV file for patient ${patientId}`);
    }
    
    const parsed = Papa.parse(csvText, CSV_CONFIG);
    
    if (parsed.errors.length > 0) {
      // Log parsing errors for debugging but don't throw (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error(`CSV parsing errors for ${patientId}:`, parsed.errors);
      }
    }
    
    return parsed.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error fetching or parsing CSV for ${patientId}:`, error);
    }
    throw error;
  }
};

/*
 Service class for handling patient data operations
 Provides methods for fetching and processing patient health data from CSV files
 */
/*
| Retrieves and processes all data for a specific patient
| 
| @param {string} patientId - The patient identifier
| @returns {Promise<Object>} Processed patient data including all health metrics
| @throws {Error} If patient data cannot be retrieved or processed
| */
export async function getPatientData(patientId) {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  try {
    const patientRows = await fetchPatientCsvData(patientId);

    if (!Array.isArray(patientRows) || patientRows.length === 0) {
      throw new Error(`No data found for patient ${patientId}`);
    }

    return processPatientData(patientRows, patientId);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error fetching patient data for ${patientId}:`, error);
    }
    throw error;
  }
}

/**
 * Processes raw CSV data into structured patient information and health metrics
 * 
 * - @param {Array} rows - Raw CSV data rows
 * - @param {string} patientId - The patient identifier
 * - @returns {Object} Structured patient data object
 * - @throws {Error} If data structure is invalid or processing fails
 */
export function processPatientData(rows, patientId) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`Invalid data structure for patient ${patientId}`);
  }

  const firstRowData = rows[0];
  if (!firstRowData) {
    throw new Error(`No valid data rows found for patient ${patientId}`);
  }

  const patientInfo = {
    patientId,
    patientNumber: patientId,
    name: firstRowData['Name'] || 'Not specified',
    age: firstRowData['Age'] || 'Not specified',
    gender: firstRowData['Gender'] || 'Not specified',
    dataAvailable: 'May 2025'
  };

  // Process medications using the cleaner individual medication fields
  const detailedMedications = [];
  
  // Get medication data from the first row (should be consistent across all rows for a patient)
  const medicationNamesStr = firstRowData['Medication_Names'] || '';
  const medicationTypesStr = firstRowData['Medication_Types'] || '';
  const medicationCategoriesStr = firstRowData['Medication_Categories'] || '';
  const medicationDosagesStr = firstRowData['Medication_Dosages'] || '';
  
  // Split the semicolon-separated strings into arrays
  const medicationNames = medicationNamesStr ? medicationNamesStr.split('; ').filter(Boolean) : [];
  const medicationTypes = medicationTypesStr ? medicationTypesStr.split('; ').filter(Boolean) : [];
  const medicationCategories = medicationCategoriesStr ? medicationCategoriesStr.split('; ').filter(Boolean) : [];
  const medicationDosages = medicationDosagesStr ? medicationDosagesStr.split('; ').filter(Boolean) : [];
  
  // Process each medication
  for (let i = 0; i < Math.max(medicationNames.length, medicationTypes.length, medicationCategories.length, medicationDosages.length); i++) {
    const name = medicationNames[i] || '';
    const type = medicationTypes[i] || '';
    const category = medicationCategories[i] || '';
    const dosage = medicationDosages[i] || '';
    
    if (name && name.trim() && 
        !name.includes('Dose not specified') && 
        name.length < 100 && // Filter out extremely long medication names
        !name.includes('Folic Acid Iron Magnesium Calcium Pain and Inflammation')) {
      detailedMedications.push({
        name: name.trim(),
        schedule: dosage.trim(), // Use dosage as schedule
        category: '', // Don't include category in visualization
        dosage: ''
      });
    }
  }

  // Process conditions
  const conditionsSet = new Set();
  const conditionsRaw = [...new Set(rows.map(row => row['Chronic_Conditions'] || row['Conditions']).filter(Boolean))];
  conditionsRaw.forEach(conditionString => {
    conditionString.split(';').forEach(c => conditionsSet.add(c.trim()));
  });

  // Process all data types
  const glucoseData = processGlucoseData(rows);
  const bloodPressureData = processBloodPressureData(rows);
  const exerciseData = processExerciseData(rows);
  const moodData = processMoodData(rows);
  const painData = processPainData(rows);
  const sleepData = processSleepData(rows);
  const mealData = processMealData(rows);

  return {
    patientInfo: { 
      ...patientInfo, 
      detailedMedications, 
      conditions: Array.from(conditionsSet)
    },
    glucoseData,
    bloodPressureData,
    exerciseData,
    moodData,
    painData,
    mealData,
    sleepData,
    rawData: rows
  };
}

// Helper functions for glucose data processing
function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
    return { hours: 0, minutes: 0 };
  }
  
  const timeParts = timeStr.split(':');
  if (timeParts.length < 2) {
    return { hours: 0, minutes: 0 };
  }
  
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  
  return {
    hours: isNaN(hours) ? 0 : hours,
    minutes: isNaN(minutes) ? 0 : minutes
  };
}

function createGlucoseReading(baseDate, value, timeStr, range, measurementType) {
  const { hours, minutes } = parseTimeString(timeStr);
  const date = new Date(baseDate);
  date.setHours(hours, minutes);
  
  return {
    date: date,
    value: value,
    range: range,
    measurementType: measurementType
  };
}

function processMultiColumnGlucose(row, baseDate) {
  const readings = [];
  
  for (let i = 1; i <= 4; i++) {
    const value = parseFloat(row[`Glucose_${i}`]);
    const timeStr = row[`Glucose_Time_${i}`];
    
    if (value > 0 && timeStr) {
      const reading = createGlucoseReading(
        baseDate,
        value,
        timeStr,
        row[`Glucose_Range_${i}`],
        row[`Glucose_Measurement_Type_${i}`]
      );
      readings.push(reading);
    }
  }
  
  return readings;
}

function processSingleColumnGlucose(row, baseDate) {
  const value = parseFloat(row['Glucose_Level']);
  if (value > 0) {
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    const date = new Date(baseDate);
    date.setHours(randomHour, randomMinute);
    
    let range = 'in range';
    if (value < 70) range = 'below range';
    else if (value > 180) range = 'above range';
    
    return [{
      date: date,
      value: value,
      range: range,
      measurementType: 'Random'
    }];
  }
  return [];
}

/**
 * Processes blood glucose data from CSV rows
 */
export function processGlucoseData(rows) {
  const readings = [];
  
  rows.forEach(row => {
    const baseDate = new Date(row['Date']);
    const hasMultiColumn = row['Glucose_1'] !== undefined;
    
    if (hasMultiColumn) {
      readings.push(...processMultiColumnGlucose(row, baseDate));
    } else {
      readings.push(...processSingleColumnGlucose(row, baseDate));
    }
  });
  
  return readings;
}

/**
 * Processes blood pressure data from CSV rows
 */
export function processBloodPressureData(rows) {
  const readings = [];
    
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const baseDate = new Date(row['Date']);
      
      const hasMultiColumn = row['Systolic_1'] !== undefined;
      
      if (hasMultiColumn) {
        // Process up to 4 readings per day
        for (let i = 1; i <= 4; i++) {
          const systolic = parseInt(row[`Systolic_${i}`]);
          const diastolic = parseInt(row[`Diastolic_${i}`]);
          const timeStr = row[`BP_Time_${i}`];
          
          if (systolic > 0 && diastolic > 0 && timeStr) {
            const timeParts = timeStr.split(':');
            if (timeParts.length >= 2) {
              const hours = parseInt(timeParts[0], 10);
              const minutes = parseInt(timeParts[1], 10);
              
              if (!isNaN(hours) && !isNaN(minutes)) {
                const date = new Date(baseDate);
                date.setHours(hours, minutes);
                
                readings.push({ 
                  date: date, 
                  systolic: systolic, 
                  diastolic: diastolic, 
                  systolicType: row[`Systolic_Type_${i}`],
                  diastolicType: row[`Diastolic_Type_${i}`]
                });
              }
            }
          }
        }
      } else {
        // Single reading format
        const systolic = parseInt(row['Systolic_BP']);
        const diastolic = parseInt(row['Diastolic_BP']);
        
        if (systolic > 0 && diastolic > 0) {
          const randomHour = Math.floor(Math.random() * 24);
          const randomMinute = Math.floor(Math.random() * 60);
          const date = new Date(baseDate);
          date.setHours(randomHour, randomMinute);
          
          let systolicType = 'normal';
          let diastolicType = 'normal';
          
          if (systolic >= 180 || diastolic >= 120) {
            systolicType = 'hypertensive crisis';
            diastolicType = 'hypertensive crisis';
          } else if (systolic >= 140 || diastolic >= 90) {
            systolicType = 'high';
            diastolicType = 'high';
          } else if (systolic >= 130 || diastolic >= 80) {
            systolicType = 'elevated';
            diastolicType = 'elevated';
          }
          
          readings.push({ 
            date: date, 
            systolic: systolic, 
            diastolic: diastolic, 
            systolicType: systolicType,
            diastolicType: diastolicType
          });
        }
      }
    }
  
  return readings;
}

/**
 * Processes exercise data from CSV rows
 * 
 * - @param {Array} rows - CSV data rows
 * - @returns {Array} Processed exercise data with activity types and durations
 */
export function processExerciseData(rows) {
  const exerciseByDate = {};
    
    rows.forEach(row => {
        const date = new Date(row['Date']);
        const dateKey = date.toDateString();
        if (!exerciseByDate[dateKey]) {
            exerciseByDate[dateKey] = { date, walking: 0, swimming: 0, running: 0, biking: 0, 'muscle-strengthening': 0, balance: 0, other: 0, totalMinutes: 0 };
        }
        
        const hasMultiColumn = row['Exercise_Type_1'] !== undefined;
        
        if (hasMultiColumn) {
            for (let i = 1; i <= 5; i++) {
                const type = row[`Exercise_Type_${i}`]?.toLowerCase();
                const minutes = parseFloat(row[`Exercise_Minutes_${i}`]);
                if (type && minutes > 0) {
                    categorizeExercise(type, minutes, exerciseByDate[dateKey]);
                }
            }
        } else {
            const type = row['Exercise_Type']?.toLowerCase();
            const minutes = parseFloat(row['Exercise_Minutes']);
            if (type && minutes > 0) {
                categorizeExercise(type, minutes, exerciseByDate[dateKey]);
            }
        }
    });
  
  return Object.values(exerciseByDate).filter(d => d.totalMinutes > 0);
}

/**
 * Categorizes exercise activities into predefined types
 * 
 * - @param {string} type - Exercise type from CSV
 * - @param {number} minutes - Duration in minutes
 * - @param {Object} dayData - Daily exercise data object
 */
export function categorizeExercise(type, minutes, dayData) {
  if (type.includes('walking')) dayData.walking += minutes;
    else if (type.includes('swimming')) dayData.swimming += minutes;
    else if (type.includes('running')) dayData.running += minutes;
    else if (type.includes('biking')) dayData.biking += minutes;
    else if (type.includes('muscle-strengthening') || type.includes('muscle strengthening') || type.includes('strength')) dayData['muscle-strengthening'] += minutes;
    else if (type.includes('balance')) dayData.balance += minutes;
  else dayData.other += minutes;
  dayData.totalMinutes += minutes;
}

/**
 * Processes mood data from CSV rows
 */
export function processMoodData(rows) {
  const moodData = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row['Mood']) {
        moodData.push({
          date: new Date(row['Date']),
          mood: row['Mood'],
          category: row['Mood'] || 'neutral'
        });
      }
    }
  
  return moodData;
}

/**
 * Processes pain data from CSV rows
 */
export function processPainData(rows) {
  const painData = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row['Pain_Location'] && row['Pain_Level']) {
        painData.push({
          date: new Date(row['Date']),
          location: row['Pain_Location'].toLowerCase(),
          level: parseInt(row['Pain_Level'])
        });
      }
    }
  
  return painData;
}

/**
 * Processes sleep data from CSV rows
 */
export function processSleepData(rows) {
  const sleepData = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row['Sleep_Hours'] && row['Sleep_Quality']) {
        sleepData.push({
          date: new Date(row['Date']),
          hours: parseFloat(row['Sleep_Hours']),
          quality: row['Sleep_Quality'],
          qualityCode: parseInt(row['Sleep_Quality_Code'])
        });
      }
    }
  
  return sleepData;
}

/**
 * Processes meal data from CSV rows
 */
export function processMealData(rows) {
  const filteredRows = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Late Night Snack'];
      let hasMealData = false;
      
      // Check each meal type
      for (let j = 0; j < mealTypes.length; j++) {
        const mealType = mealTypes[j];
        const time = row[`${mealType}_Time`];
        const protein = row[`${mealType}_Protein`];
        const carbs = row[`${mealType}_Carbohydrates`];
        const vegetables = row[`${mealType}_Vegetables`];
        const fruit = row[`${mealType}_Fruit`];
        const alcohol = row[`${mealType}_Alcohol`];
        const sugar = row[`${mealType}_Added_Sugar`];
        
        // Check if time exists and at least one food component is present
        const hasFood = protein === 1 || protein === '1' || 
                       carbs === 1 || carbs === '1' || 
                       vegetables === 1 || vegetables === '1' || 
                       fruit === 1 || fruit === '1' || 
                       alcohol === 1 || alcohol === '1' || 
                       (sugar && sugar !== '' && sugar !== 'NaN');
        
        if (time && hasFood) {
          hasMealData = true;
          break;
        }
      }
      
      if (hasMealData) {
        filteredRows.push(row);
      }
    }
  
  return filteredRows;
}
