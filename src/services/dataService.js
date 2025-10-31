/*
 dataService.js - Patient Data Service
 
 This service handles all data operations for the health dashboard. It fetches patient CSV data from the server and parses and processes CSV data using PapaParse. It transforms raw data into structured health metrics and provides data validation and error handling. The service manages patient information, medications, and health tracking data. It supports all health metric types including glucose, blood pressure, exercise, mood, pain, sleep, and meals. The service uses the PapaParse library for CSV parsing and implements a service class pattern for data operations. It provides error handling and validation and supports multiple data formats and structures. Data processing includes CSV parsing with header validation, data transformation and normalization, type conversion and validation, and error recovery and fallback mechanisms. The service handles blood glucose monitoring with meal context, blood pressure tracking with risk categorization, exercise activity tracking and categorization, mood assessment and tracking, pain reporting with anatomical mapping, sleep quality and duration analysis, and nutritional intake and meal composition. Error handling includes network error recovery, CSV parsing error handling, data validation and sanitization, and graceful degradation for missing data.
 */

import Papa from 'papaparse';

// Configuration for CSV parsing
const CSV_CONFIG = {
  header: true,
  skipEmptyLines: true,
  transformHeader: (header) => header?.trim() || '',
  transform: (value) => value?.trim() || '',
  dynamicTyping: false, // Keep everything as strings to avoid parsing issues
  delimiter: ',',
  quoteChar: '"',
  escapeChar: '"'
};

/*
 Fetches and parses CSV data for a specific patient. Returns parsed CSV data as array of objects. Throws error if CSV fetch or parsing fails.
 */
const fetchPatientCsvData = async (patientId) => {
  try {
    // Use relative path for both dev and production (works with PUBLIC_URL)
    const url = `${process.env.PUBLIC_URL}/synthetic_patients/${patientId}.csv?v=${Date.now()}`;
    const response = await fetch(url);
    
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
        console.warn(`CSV parsing warnings for ${patientId}:`, parsed.errors);
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
 * Processes raw CSV data into structured patient information and health metrics. Returns structured patient data object. Throws error if data structure is invalid or processing fails.
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

  // Process medications from the first row
  const detailedMedications = [];
  const medicationNamesStr = firstRowData['Medication_Names'] || '';
  const medicationDosagesStr = firstRowData['Medication_Dosages'] || '';
  
  if (medicationNamesStr && medicationDosagesStr) {
    const medicationNames = medicationNamesStr.split('; ').filter(Boolean);
    const medicationDosages = medicationDosagesStr.split('; ').filter(Boolean);
    
    // Validates if a medication name is valid for processing
    function isValidMedicationName(name) {
      if (name.length === 0 || name.length >= 100) return false;
      if (name.includes('Dose not specified')) return false;
      if (name.includes('Folic Acid Iron Magnesium Calcium Pain and Inflammation')) return false;
      return true;
    }
    
    medicationNames.forEach((medicationName, index) => {
      const name = medicationName.trim();
      const dosage = medicationDosages[index]?.trim() || '';
      
      if (isValidMedicationName(name)) {
        detailedMedications.push({
          name: name,
          schedule: dosage,
          category: '',
          dosage: ''
        });
      }
    });
  }

  // Process conditions from all rows
  const conditionsSet = new Set();
  rows.forEach(row => {
    const conditionString = row['Chronic_Conditions'] || row['Conditions'] || '';
    if (conditionString) {
      const conditions = conditionString.split(';');
      conditions.forEach(condition => {
        const trimmed = condition.trim();
        if (trimmed) {
          conditionsSet.add(trimmed);
        }
      });
    }
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
    sleepData
  };
}

// Helper functions for processing glucose data
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
    
    if (!isNaN(value) && value > 0 && timeStr && timeStr.trim() !== '') {
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
  if (!isNaN(value) && value > 0) {
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
 * Processes blood glucose data from CSV rows.
 */
function processGlucoseData(rows) {
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
 * Creates a date with time from a base date and time string.
 */
function createDateWithTime(baseDate, timeStr) {
  const timeParts = timeStr.split(':');
  if (timeParts.length < 2) return null;
  
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  const date = new Date(baseDate);
  date.setHours(hours, minutes);
  return date;
}

/**
 * Determines blood pressure type based on systolic and diastolic values.
 */
function getBPType(systolic, diastolic) {
  if (systolic >= 180 || diastolic >= 120) return 'hypertensive crisis';
  if (systolic >= 140 || diastolic >= 90) return 'high';
  if (systolic >= 130 || diastolic >= 80) return 'elevated';
  return 'normal';
}

/**
 * Processes a single blood pressure reading from multi-column format.
 */
function processMultiColumnBPReading(row, index, baseDate) {
  const systolic = parseInt(row[`Systolic_${index}`]);
  const diastolic = parseInt(row[`Diastolic_${index}`]);
  const timeStr = row[`BP_Time_${index}`];
  
  const isValid = !isNaN(systolic) && !isNaN(diastolic) && 
                  systolic > 0 && diastolic > 0 && 
                  timeStr && timeStr.trim() !== '';
  
  if (!isValid) return null;
  
  const date = createDateWithTime(baseDate, timeStr);
  if (!date) return null;
  
  return {
    date,
    systolic,
    diastolic,
    systolicType: row[`Systolic_Type_${index}`],
    diastolicType: row[`Diastolic_Type_${index}`]
  };
}

/**
 * Processes a single blood pressure reading from single-column format.
 */
function processSingleColumnBPReading(row, baseDate) {
  const systolic = parseInt(row['Systolic_BP']);
  const diastolic = parseInt(row['Diastolic_BP']);
  
  if (isNaN(systolic) || isNaN(diastolic) || systolic <= 0 || diastolic <= 0) {
    return null;
  }
  
  // Generate random time for single reading format when timestamp is not available
  const randomHour = Math.floor(Math.random() * 24);
  const randomMinute = Math.floor(Math.random() * 60);
  const date = new Date(baseDate);
  date.setHours(randomHour, randomMinute);
  
  const bpType = getBPType(systolic, diastolic);
  
  return {
    date,
    systolic,
    diastolic,
    systolicType: bpType,
    diastolicType: bpType
  };
}

/**
 * Processes blood pressure data from CSV rows.
 */
function processBloodPressureData(rows) {
  const readings = [];
  
  for (const row of rows) {
    const baseDate = new Date(row['Date']);
    const hasMultiColumn = row['Systolic_1'] !== undefined;
    
    if (hasMultiColumn) {
      // Process up to 4 readings per day
      for (let j = 1; j <= 4; j++) {
        const reading = processMultiColumnBPReading(row, j, baseDate);
        if (reading) readings.push(reading);
      }
    } else {
      // Single reading format
      const reading = processSingleColumnBPReading(row, baseDate);
      if (reading) readings.push(reading);
    }
  }
  
  return readings;
}

/**
 * Creates initial exercise data structure for a date.
 */
function createExerciseDayData(date) {
  return {
    date,
    walking: 0,
    swimming: 0,
    running: 0,
    biking: 0,
    'muscle-strengthening': 0,
    balance: 0,
    other: 0,
    totalMinutes: 0
  };
}

/**
 * Processes a single exercise entry.
 */
function processExerciseEntry(row, index, dayData) {
  const typeKey = index ? `Exercise_Type_${index}` : 'Exercise_Type';
  const minutesKey = index ? `Exercise_Minutes_${index}` : 'Exercise_Minutes';
  
  const type = row[typeKey]?.toLowerCase();
  const minutes = parseFloat(row[minutesKey]);
  
  if (type && type.trim() !== '' && !isNaN(minutes) && minutes > 0) {
    categorizeExercise(type, minutes, dayData);
  }
}

/**
 * Processes exercise data from CSV rows. Returns processed exercise data with activity types and durations.
 */
function processExerciseData(rows) {
  const exerciseByDate = {};
  
  for (const row of rows) {
    const date = new Date(row['Date']);
    const dateKey = date.toDateString();
    
    if (!exerciseByDate[dateKey]) {
      exerciseByDate[dateKey] = createExerciseDayData(date);
    }
    
    const dayData = exerciseByDate[dateKey];
    const hasMultiColumn = row['Exercise_Type_1'] !== undefined;
    
    if (hasMultiColumn) {
      // Process up to 5 exercise entries per day
      for (let j = 1; j <= 5; j++) {
        processExerciseEntry(row, j, dayData);
      }
    } else {
      // Single exercise entry
      processExerciseEntry(row, null, dayData);
    }
  }
  
  return Object.values(exerciseByDate).filter(d => d.totalMinutes > 0);
}

/**
 * Categorizes exercise activities into predefined types and adds them to the daily exercise data object.
 */
function categorizeExercise(type, minutes, dayData) {
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
 * Processes mood data from CSV rows.
 */
function processMoodData(rows) {
  const moodData = [];
    
  rows.forEach(row => {
    if (row['Mood'] && row['Mood'].trim() !== '') {
      moodData.push({
        date: new Date(row['Date']),
        mood: row['Mood'],
        category: row['Mood'] || 'neutral'
      });
    }
  });
  
  return moodData;
}

/**
 * Processes pain data from CSV rows.
 */
function processPainData(rows) {
  const painData = [];
    
  rows.forEach(row => {
    if (row['Pain_Location'] && row['Pain_Location'].trim() !== '' && row['Pain_Level'] !== undefined) {
      const painLevel = parseInt(row['Pain_Level']);
      if (!isNaN(painLevel)) {
        painData.push({
          date: new Date(row['Date']),
          location: row['Pain_Location'].toLowerCase(),
          level: painLevel
        });
      }
    }
  });
  
  return painData;
}

/**
 * Processes sleep data from CSV rows.
 */
function processSleepData(rows) {
  const sleepData = [];
    
  rows.forEach(row => {
    if (row['Sleep_Hours'] && row['Sleep_Quality']) {
      const hours = parseFloat(row['Sleep_Hours']);
      const qualityCode = parseInt(row['Sleep_Quality_Code']);
      if (!isNaN(hours) && !isNaN(qualityCode)) {
        sleepData.push({
          date: new Date(row['Date']),
          hours: hours,
          quality: row['Sleep_Quality'],
          qualityCode: qualityCode
        });
      }
    }
  });
  
  return sleepData;
}

/**
 * Checks if a meal has any food components.
 */
function hasMealComponents(row, mealType) {
  const components = [
    row[`${mealType}_Protein`],
    row[`${mealType}_Carbohydrates`],
    row[`${mealType}_Vegetables`],
    row[`${mealType}_Fruit`],
    row[`${mealType}_Alcohol`],
    row[`${mealType}_Added_Sugar`]
  ];
  
  return components.some(comp => 
    comp === 1 || comp === '1' || (comp && comp !== '' && comp !== 'NaN')
  );
}

/**
 * Checks if a row has any meal data.
 */
function hasAnyMealData(row) {
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Late Night Snack'];
  
  return mealTypes.some(mealType => {
    const time = row[`${mealType}_Time`];
    return time && hasMealComponents(row, mealType);
  });
}

/**
 * Processes meal data from CSV rows and returns rows that have meal data.
 */
function processMealData(rows) {
  return rows.filter(row => hasAnyMealData(row));
}
