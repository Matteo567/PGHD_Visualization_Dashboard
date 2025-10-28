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
  const expandChart = (chartId) => {
    setExpandedChart(chartId);
  };
  
  const collapseChart = () => {
    setExpandedChart(null);
  };
  
  const toggleChart = (chartId) => {
    if (expandedChart === chartId) {
      collapseChart();
    } else {
      expandChart(chartId);
    }
  };
  
  // Summary toggle functions
  const enableThreeMonthSummaries = () => {
    setShowThreeMonthSummaries(true);
  };
  
  const disableThreeMonthSummaries = () => {
    setShowThreeMonthSummaries(false);
  };
  
  const toggleThreeMonthSummaries = () => {
    setShowThreeMonthSummaries(prev => !prev);
  };
  
  return {
    // State
    expandedChart,
    showThreeMonthSummaries,
    
    // Chart functions
    expandChart,
    collapseChart,
    toggleChart,
    
    // Summary functions
    enableThreeMonthSummaries,
    disableThreeMonthSummaries,
    toggleThreeMonthSummaries
  };
}

export default useDashboardState;
