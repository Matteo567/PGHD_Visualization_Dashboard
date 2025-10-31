// Hook for managing dashboard state including chart expansion and summary toggles
import { useState } from 'react';

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
