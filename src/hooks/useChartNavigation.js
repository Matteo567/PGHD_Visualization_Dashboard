/*
 Simple chart navigation hook
 Provides navigation state and functions for charts
 */

import { useState } from 'react';

const useChartNavigation = (chartType, initialDate = new Date(2025, 4, 1)) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  // Determine navigation type based on chart type
  const navigationType = chartType === 'mood' ? 'month' : 'week';
  const navigationLabel = chartType === 'mood' ? 'Month' : 'Week';

  // Go to previous week or month
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (navigationType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  // Go to next week or month
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (navigationType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // Get date range for current period
  const getDateRange = () => {
    if (navigationType === 'month') {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return { start: startOfMonth, end: endOfMonth };
    } else {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return { start: startOfWeek, end: endOfWeek };
    }
  };

  // Get current month/year display
  const getCurrentMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get current week display
  const getCurrentWeekDisplay = () => {
    const range = getDateRange();
    const startStr = range.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = range.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  // Get formatted date range with year (e.g., "May 1 - 7, 2025" for weeks or "May 1 - 31, 2025" for months)
  const getFormattedDateRange = () => {
    const range = getDateRange();
    const startMonth = range.start.toLocaleDateString('en-US', { month: 'long' });
    const startDay = range.start.getDate();
    const endDay = range.end.getDate();
    const year = range.start.getFullYear();
    
    // Check if start and end are in the same month
    if (range.start.getMonth() === range.end.getMonth()) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      // Different months (edge case for weeks spanning month boundaries)
      const endMonth = range.end.toLocaleDateString('en-US', { month: 'long' });
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  // Get 3-month date range
  const getThreeMonthRange = () => {
    const endOfThreeMonths = new Date(currentDate);
    const startOfThreeMonths = new Date(currentDate);
    startOfThreeMonths.setMonth(startOfThreeMonths.getMonth() - 3);
    
    const dataStartDate = new Date(2024, 6, 1);
    if (startOfThreeMonths < dataStartDate) {
      startOfThreeMonths.setTime(dataStartDate.getTime());
    }
    
    const dataEndDate = new Date(2025, 6, 31);
    if (endOfThreeMonths > dataEndDate) {
      endOfThreeMonths.setTime(dataEndDate.getTime());
    }
    
    return { start: startOfThreeMonths, end: endOfThreeMonths };
  };

  // Get 3-month display string
  const getThreeMonthDisplay = () => {
    const range = getThreeMonthRange();
    const startStr = range.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const endStr = range.end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return {
    currentDate,
    navigationType,
    navigationLabel,
    goToPrevious,
    goToNext,
    getDateRange,
    getThreeMonthRange,
    getCurrentMonthYear,
    getCurrentWeekDisplay,
    getThreeMonthDisplay,
    getFormattedDateRange
  };
};

export default useChartNavigation;
