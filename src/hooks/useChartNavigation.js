// Hook that manages chart navigation with week or month navigation
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
      // Subtract 7 days for week navigation to go to previous week
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
      // Add 7 days for week navigation to go to next week
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // Get month date range (first day to last day of current month)
  const getMonthDateRange = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0); // Last day of month which is day 0 of next month
    return { start: startOfMonth, end: endOfMonth };
  };

  // Get week date range (Sunday to Saturday)
  const getWeekDateRange = () => {
    const startOfWeek = new Date(currentDate);
    const currentDayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 6 = Saturday
    const daysToSubtract = currentDayOfWeek; // Go back to Sunday to start the week
    
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0); // Start of day
    
    const endOfWeek = new Date(startOfWeek);
    const daysInWeek = 6; // Sunday to Saturday equals 7 days but we start on Sunday so add 6
    endOfWeek.setDate(endOfWeek.getDate() + daysInWeek);
    endOfWeek.setHours(23, 59, 59, 999); // End of day
    
    return { start: startOfWeek, end: endOfWeek };
  };

  // Get date range for current period (week or month)
  const getDateRange = () => {
    if (navigationType === 'month') {
      return getMonthDateRange();
    } else {
      return getWeekDateRange();
    }
  };

  // Get formatted date range with year for example May 1 to 7, 2025 for weeks or May 1 to 31, 2025 for months
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
      // Different months for edge case when weeks span month boundaries
      const endMonth = range.end.toLocaleDateString('en-US', { month: 'long' });
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  // Get three month date range which is three months before current date
  const getThreeMonthRange = () => {
    const endOfThreeMonths = new Date(currentDate);
    const startOfThreeMonths = new Date(currentDate);
    startOfThreeMonths.setMonth(startOfThreeMonths.getMonth() - 3);
    
    // Make sure we do not go before the earliest data date
    const dataStartDate = new Date(2024, 6, 1);
    if (startOfThreeMonths < dataStartDate) {
      startOfThreeMonths.setTime(dataStartDate.getTime());
    }
    
    // Make sure we do not go after the latest data date
    const dataEndDate = new Date(2025, 6, 31);
    if (endOfThreeMonths > dataEndDate) {
      endOfThreeMonths.setTime(dataEndDate.getTime());
    }
    
    return { start: startOfThreeMonths, end: endOfThreeMonths };
  };

  // Get three month display string
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
    getThreeMonthDisplay,
    getFormattedDateRange
  };
};

export default useChartNavigation;
