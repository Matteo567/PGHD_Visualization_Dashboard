/*
 useDashboardState.js - Custom Hook for Dashboard State Management
 
 This hook provides a simplified interface for managing dashboard state including
 chart expansion, summary toggles, and other UI state. It replaces complex
 state management patterns with clear, descriptive function names.
 
 Benefits:
 - Clear function names instead of complex state setters
 - Centralized state management
 - Easier to understand and maintain
 - Better separation of concerns
 */

import React, { useState } from 'react';

function useDashboardState() {
  const [expandedChart, setExpandedChart] = useState(null);
  const [showThreeMonthSummaries, setShowThreeMonthSummaries] = useState(false);
  
  // Chart expansion functions
  const toggleChart = (chartId) => {
    if (expandedChart === chartId) {
      setExpandedChart(null);
    } else {
      setExpandedChart(chartId);
    }
  };
  
  // Summary toggle functions
  const toggleThreeMonthSummaries = () => {
    setShowThreeMonthSummaries(prev => !prev);
  };
  
  return {
    // State
    expandedChart,
    showThreeMonthSummaries,
    
    // Chart functions
    toggleChart,
    
    // Summary functions
    toggleThreeMonthSummaries
  };
}

export default useDashboardState;
