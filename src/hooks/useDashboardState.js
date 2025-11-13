// Hook that manages dashboard state including chart expansion and summary toggles
import { useState } from 'react';

function useDashboardState() {
  const [expandedChart, setExpandedChart] = useState(null);
  const [showThreeMonthSummaries, setShowThreeMonthSummaries] = useState(false);
  
  // Functions for chart expansion
  const toggleChart = (chartId) => {
    if (expandedChart === chartId) {
      setExpandedChart(null);
    } else {
      setExpandedChart(chartId);
    }
  };
  
  // Functions for summary toggle
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
