// Hook for loading patient data from CSV files and managing loading and error states
import React, { useState, useEffect } from 'react';
import { getPatientData } from '../services/dataService';
const usePatientData = (patientId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async (id) => {
    if (!id || typeof id !== 'string') {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const patientData = await getPatientData(id);
      
      if (patientData && patientData.patientInfo) {
        setData(patientData);
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setData(null);
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading patient data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadData(patientId);
    } else {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, [patientId]);

  return {
    data,
    loading,
    error,
    glucoseData: data?.glucoseData || [],
    bloodPressureData: data?.bloodPressureData || [],
    exerciseData: data?.exerciseData || [],
    moodData: data?.moodData || [],
    painData: data?.painData || [],
    mealData: data?.mealData || [],
    sleepData: data?.sleepData || []
  };
};

export default usePatientData;
