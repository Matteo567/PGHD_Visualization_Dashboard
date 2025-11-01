/**
 ExerciseChart.js - Exercise Activity Tracking Visualization
 
 This component provides exercise monitoring with activity type breakdown including walking, swimming, running, biking, muscle-strengthening, and balance activities. It tracks duration and provides weekly summaries with color-coded activity categorization. It includes interactive tooltips with exercise details and navigation controls for time periods. It integrates with patient data and chart navigation. The component uses custom SVG for stacked bar chart visualization and implements an activity categorization system with emoji indicators. It provides color-coded activity types for identification and supports expandable views. It implements time-based navigation and data filtering. Visualization features include a stacked bar chart showing daily activity breakdown, color-coded activity types with emoji indicators, interactive tooltips with detailed exercise information, design that adapts to container size, and dynamic Y-axis scaling based on data range. Activity categories include walking as low-impact cardiovascular exercise, swimming as full-body cardiovascular workout, running as high-impact cardiovascular exercise, biking as low-impact cardiovascular exercise, muscle-strengthening as strength training activities, balance as balance and stability training, and other as miscellaneous physical activities. Component structure includes a main SVG container with sizing for the chart container, duration scale with dynamic labeling on the Y-axis, day-of-week labels with date information on the X-axis, stacked activity bars with color coding for data bars, activity type explanations with emojis in the legend, and detailed exercise information on hover in tooltips. This component is used for physical activity monitoring and fitness tracking.
 */

import React, { useState, useRef, useEffect } from 'react';
import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';
import Legend from '../Legend';
import './ExerciseChart.css';

const exerciseTypes = [
  { key: 'walking', label: 'Walking', color: 'var(--chart-color-walking)', emoji: '🚶' },
  { key: 'swimming', label: 'Swimming', color: 'var(--chart-color-swimming)', emoji: '🏊‍♀️' },
  { key: 'running', label: 'Running', color: 'var(--chart-color-running)', emoji: '🏃‍♂️' },
  { key: 'biking', label: 'Biking', color: 'var(--chart-color-biking)', emoji: '🚴' },
  { key: 'muscle-strengthening', label: 'Muscle-Strengthening', color: 'var(--chart-color-resistance)', emoji: '🏋️' },
  { key: 'balance', label: 'Balance', color: 'var(--chart-color-balance)', emoji: '🧘' },
  { key: 'other', label: 'Other', color: 'var(--chart-color-other)', emoji: '➕' },
];

const exerciseLegendItems = exerciseTypes.map(({ label, color, emoji }) => ({
  label: `${emoji} ${label}`,
  color,
}));

const ExerciseChart = ({ patientId, isExpanded = false, onExpand, accessType = 'Admin', navigation, screenshotMode = false, showThreeMonthSummaries = false }) => {
  const { exerciseData, loading, error } = usePatientData(patientId);
  
  // For Physician access, force Weekly Goals view (hide Activity Breakdown).
  // For Patient and Admin, allow toggling between both views.
  const shouldForceWeeklyGoals = accessType === 'Physician';
  
  // Determine initial view state
  let initialShowWeeklyGoals = false;
  if (shouldForceWeeklyGoals) {
    initialShowWeeklyGoals = true;
  }
  
  // State for toggling between activity breakdown and weekly goals view
  const [showWeeklyGoals, setShowWeeklyGoals] = useState(initialShowWeeklyGoals);
  
  // Update state when accessType changes
  useEffect(() => {
    if (shouldForceWeeklyGoals) {
      setShowWeeklyGoals(true);
    } else {
      // Patient and Admin default to Activity Breakdown
      setShowWeeklyGoals(false);
    }
  }, [accessType, shouldForceWeeklyGoals]);
  
  // Use navigation from parent or fallback to internal navigation
  const internalNavigation = useChartNavigation('exercise');
  const nav = navigation || internalNavigation;

  // Inline configuration for chart dimensions and styling
  const config = isExpanded 
    ? {
        width: 700,
        height: 550,
        padding: { top: 80, right: 60, bottom: 100, left: 80 },
        dayWidth: 80,
        fontSize: {
          yAxis: 16,
          yAxisTitle: 18,
          timeLabel: 14,
          dayLabel: 14,
          dateLabel: 14,
          emoji: 12,
        },
        barWidth: 12,
      }
    : {
        width: 450,
        height: 350,
        padding: { top: 60, right: 40, bottom: 80, left: 60 },
        dayWidth: 50,
        fontSize: {
          yAxis: 14,
          yAxisTitle: 16,
          timeLabel: 12,
          dayLabel: 12,
          dateLabel: 12,
          emoji: 10,
        },
        barWidth: 8,
      };
  
  const chartHeight = config.height - config.padding.top - config.padding.bottom;

  const { start: startOfWeek, end: endOfWeek } = nav.getDateRange();

  const weekData = exerciseData.filter(d => {
    if (!d.date) return false;
    const itemDate = new Date(d.date);
    return itemDate >= startOfWeek && itemDate <= endOfWeek;
  });

  // Get 3-month data
  const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
  const threeMonthData = exerciseData.filter(d => {
    if (!d.date) return false;
    const itemDate = new Date(d.date);
    return itemDate >= startOfThreeMonths && itemDate <= endOfThreeMonths;
  });

  // Helper functions for exercise data processing
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const initializeDayData = () => ({
    walking: 0,
    swimming: 0,
    running: 0,
    biking: 0,
    'muscle-strengthening': 0,
    balance: 0,
    other: 0,
    totalMinutes: 0
  });

  const processExerciseData = (weekData) => {
    const groupedData = {};
    
    // Initialize all days
    daysOfWeek.forEach(day => {
      groupedData[day] = initializeDayData();
    });
    
    // Process each exercise item
    weekData.forEach(item => {
      if (!item.date) return;
      
      const date = new Date(item.date);
      const dayName = !isNaN(date.getTime()) ? daysOfWeek[date.getDay()] : 'Invalid';
      const dayData = groupedData[dayName];
      
      if (dayData) {
        dayData.walking += Number(item.walking) || 0;
        dayData.swimming += Number(item.swimming) || 0;
        dayData.running += Number(item.running) || 0;
        dayData.biking += Number(item.biking) || 0;
        dayData['muscle-strengthening'] += Number(item['muscle-strengthening']) || 0;
        dayData.balance += Number(item.balance) || 0;
        dayData.other += Number(item.other) || 0;
        
        // Calculate total minutes
        dayData.totalMinutes = dayData.walking + dayData.swimming + dayData.running + 
                             dayData.biking + dayData['muscle-strengthening'] + 
                             dayData.balance + dayData.other;
      }
    });
    
    return groupedData;
  };

  const groupedData = processExerciseData(weekData);

  // Calculate weekly exercise categories for physician view
  const aerobic = Object.values(groupedData).reduce((sum, day) => 
    sum + day.walking + day.swimming + day.running + day.biking, 0);
  const strength = Object.values(groupedData).reduce((sum, day) => 
    sum + day['muscle-strengthening'], 0);
  const flexibility = Object.values(groupedData).reduce((sum, day) => 
    sum + day.balance, 0);
  
  const strengthSessions = Object.values(groupedData).filter(day => day['muscle-strengthening'] > 0).length;
  const flexibilitySessions = Object.values(groupedData).filter(day => day.balance > 0).length;
  
  const weeklyCategories = {
    aerobic,
    strength,
    flexibility,
    strengthSessions,
    flexibilitySessions
  };

  // Calculate percentages for physician view
  const aerobicGoal = 150;
  const strengthGoal = 2;
  const flexibilityGoal = 1;
  
  const categoryPercentages = {
    aerobic: Math.min(100, Math.round((weeklyCategories.aerobic / aerobicGoal) * 100)),
    strength: Math.min(100, Math.round((weeklyCategories.strengthSessions / strengthGoal) * 100)),
    flexibility: Math.min(100, Math.round((weeklyCategories.flexibilitySessions / flexibilityGoal) * 100))
  };

  const exerciseValues = Object.values(groupedData).map(day => day.totalMinutes);
  const maxVal = exerciseValues.length > 0 ? Math.max(...exerciseValues, 0) : 0;
  const maxDuration = Math.max(60, Math.ceil(maxVal / 30) * 30);

  const generateYAxisLabels = (max) => {
    if (max === 0) return [0];
    const step = Math.max(15, Math.ceil(max / 6 / 15) * 15);
    const labels = [];
    for (let i = 0; i <= max; i += step) {
      labels.push(i);
    }
    return labels;
  };

  const yAxisLabels = generateYAxisLabels(maxDuration);

  // Calculate summary statistics for physician view
  let weekSummary = null;
  if (weekData.length > 0) {

    const totalMinutes = Object.values(groupedData).reduce((sum, day) => sum + day.totalMinutes, 0);
    const avgMinutesPerDay = (totalMinutes / 7).toFixed(0);
    
    // Count days with exercise
    const daysWithExercise = Object.values(groupedData).filter(day => day.totalMinutes > 0).length;
    
    // Find most common exercise type
    const exerciseTypeTotals = {};
    exerciseTypes.forEach(type => {
      exerciseTypeTotals[type.key] = Object.values(groupedData).reduce((sum, day) => sum + day[type.key], 0);
    });
    
    const mostCommonExercise = Object.entries(exerciseTypeTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Calculate exercise consistency (days with 30+ minutes)
    const daysWithAdequateExercise = Object.values(groupedData).filter(day => day.totalMinutes >= 30).length;
    
    // Calculate average session length
    const totalSessions = weekData.filter(item => {
      const date = new Date(item.date);
      const dayName = !isNaN(date.getTime()) ? daysOfWeek[date.getDay()] : 'Invalid';
      return groupedData[dayName] && groupedData[dayName].totalMinutes > 0;
    }).length;
    
    const avgSessionLength = totalSessions > 0 ? (totalMinutes / totalSessions).toFixed(0) : 0;

    weekSummary = {
      totalMinutes,
      avgMinutesPerDay,
      daysWithExercise,
      mostCommonExercise: mostCommonExercise[0],
      mostCommonExerciseMinutes: mostCommonExercise[1],
      daysWithAdequateExercise,
      totalSessions,
      avgSessionLength
    };
  }

  // Calculate 3-month summary statistics for physician view
  let threeMonthSummary = null;
  let threeMonthWeeklyGoalsSummary = null;
  if (threeMonthData.length > 0) {

    // Group 3-month data by day
    const threeMonthGroupedData = {};
    threeMonthData.forEach(item => {
      if (!item.date) return;
      const date = new Date(item.date);
      const dayName = !isNaN(date.getTime()) ? daysOfWeek[date.getDay()] : 'Invalid';
      if (!threeMonthGroupedData[dayName]) {
        threeMonthGroupedData[dayName] = { walking: 0, swimming: 0, running: 0, biking: 0, 'muscle-strengthening': 0, balance: 0, other: 0, totalMinutes: 0 };
      }
      threeMonthGroupedData[dayName].walking += Number(item.walking) || 0;
      threeMonthGroupedData[dayName].swimming += Number(item.swimming) || 0;
      threeMonthGroupedData[dayName].running += Number(item.running) || 0;
      threeMonthGroupedData[dayName].biking += Number(item.biking) || 0;
      threeMonthGroupedData[dayName]['muscle-strengthening'] += Number(item['muscle-strengthening']) || 0;
      threeMonthGroupedData[dayName].balance += Number(item.balance) || 0;
      threeMonthGroupedData[dayName].other += Number(item.other) || 0;
      threeMonthGroupedData[dayName].totalMinutes = threeMonthGroupedData[dayName].walking + threeMonthGroupedData[dayName].swimming + threeMonthGroupedData[dayName].running + threeMonthGroupedData[dayName].biking + threeMonthGroupedData[dayName]['muscle-strengthening'] + threeMonthGroupedData[dayName].balance + threeMonthGroupedData[dayName].other;
    });

    const totalMinutes = Object.values(threeMonthGroupedData).reduce((sum, day) => sum + day.totalMinutes, 0);
    
    // Calculate actual days in the 3-month period
    const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
    const daysInThreeMonths = Math.ceil((endOfThreeMonths - startOfThreeMonths) / (1000 * 60 * 60 * 24)) + 1;
    const avgMinutesPerDay = (totalMinutes / daysInThreeMonths).toFixed(0);
    
    // Count days with exercise
    const daysWithExercise = Object.values(threeMonthGroupedData).filter(day => day.totalMinutes > 0).length;
    
    // Find most common exercise type
    const exerciseTypeTotals = {};
    exerciseTypes.forEach(type => {
      exerciseTypeTotals[type.key] = Object.values(threeMonthGroupedData).reduce((sum, day) => sum + day[type.key], 0);
    });
    
    const mostCommonExercise = Object.entries(exerciseTypeTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Calculate average session length
    const totalSessions = threeMonthData.filter(item => {
      const date = new Date(item.date);
      const dayName = !isNaN(date.getTime()) ? daysOfWeek[date.getDay()] : 'Invalid';
      return threeMonthGroupedData[dayName] && threeMonthGroupedData[dayName].totalMinutes > 0;
    }).length;
    
    const avgSessionLength = totalSessions > 0 ? (totalMinutes / totalSessions).toFixed(0) : 0;

    threeMonthSummary = {
      totalMinutes,
      avgMinutesPerDay,
      daysWithExercise,
      mostCommonExercise: mostCommonExercise[0],
      mostCommonExerciseMinutes: mostCommonExercise[1],
      totalSessions,
      avgSessionLength
    };

    // Calculate weekly goals met in 3-month period
    // Split 3-month data into weeks and check goal achievement for each week
    const weeklyGoalsData = [];
    let currentWeekStart = new Date(startOfThreeMonths);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Adjust to start of week (Sunday)
    const dayOfWeek = currentWeekStart.getDay();
    currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);

    while (currentWeekStart <= endOfThreeMonths) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get data for this week
      const weekDataForAnalysis = threeMonthData.filter(d => {
        if (!d.date) return false;
        const itemDate = new Date(d.date);
        return itemDate >= currentWeekStart && itemDate <= weekEnd;
      });

      if (weekDataForAnalysis.length > 0) {
        // Process week data similar to weekly calculation
        const weekGroupedData = processExerciseData(weekDataForAnalysis);
        
        const weekAerobic = Object.values(weekGroupedData).reduce((sum, day) => 
          sum + day.walking + day.swimming + day.running + day.biking, 0);
        const weekStrengthSessions = Object.values(weekGroupedData).filter(day => day['muscle-strengthening'] > 0).length;
        const weekFlexibilitySessions = Object.values(weekGroupedData).filter(day => day.balance > 0).length;

        // Check if goals are met
        const aerobicGoalMet = weekAerobic >= 150;
        const strengthGoalMet = weekStrengthSessions >= 2;
        const flexibilityGoalMet = weekFlexibilitySessions >= 1;
        const allGoalsMet = aerobicGoalMet && strengthGoalMet && flexibilityGoalMet;

        weeklyGoalsData.push({
          aerobicGoalMet,
          strengthGoalMet,
          flexibilityGoalMet,
          allGoalsMet
        });
      }

      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    // Count weeks that met goals
    const weeksMetAerobicGoal = weeklyGoalsData.filter(w => w.aerobicGoalMet).length;
    const weeksMetStrengthGoal = weeklyGoalsData.filter(w => w.strengthGoalMet).length;
    const weeksMetFlexibilityGoal = weeklyGoalsData.filter(w => w.flexibilityGoalMet).length;
    const weeksMetAllGoals = weeklyGoalsData.filter(w => w.allGoalsMet).length;
    const totalWeeks = weeklyGoalsData.length;

    threeMonthWeeklyGoalsSummary = {
      totalWeeks,
      weeksMetAerobicGoal,
      weeksMetStrengthGoal,
      weeksMetFlexibilityGoal,
      weeksMetAllGoals
    };
  }


  // Weekly goals view (when showWeeklyGoals is true)
  if (showWeeklyGoals) {
    const categories = [
      { 
        name: 'Aerobic', 
        value: weeklyCategories.aerobic, 
        goal: 150, 
        percentage: categoryPercentages.aerobic,
        color: '#4CAF50',
        description: '150 min/week goal'
      },
      { 
        name: 'Strength', 
        value: weeklyCategories.strengthSessions, 
        goal: 2, 
        percentage: categoryPercentages.strength,
        color: '#2196F3',
        description: '2+ sessions/week'
      },
      { 
        name: 'Balance', 
        value: weeklyCategories.flexibilitySessions, 
        goal: 1, 
        percentage: categoryPercentages.flexibility,
        color: '#FF9800',
        description: '1+ session/week'
      }
    ];

    return (
      <div className={`exercise-chart-container ${isExpanded ? 'expanded' : ''}`}>
        <div className="exercise-header">
          <h3 className="chart-title">Exercise Goals Progress</h3>
          <h4 className="chart-subtitle">{nav.getFormattedDateRange()}</h4>
          
          {/* View Toggle - Hide for Physician (single view only), show for Patient and Admin */}
          {accessType !== 'Physician' && (
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${!showWeeklyGoals ? 'active' : ''}`}
                onClick={() => setShowWeeklyGoals(false)}
              >
                Activity Breakdown
              </button>
              <button 
                className={`toggle-btn ${showWeeklyGoals ? 'active' : ''}`}
                onClick={() => setShowWeeklyGoals(true)}
              >
                Weekly Goals
              </button>
            </div>
          )}
        </div>
        
        <div className="physician-exercise-bars">
          {categories.map((category, index) => (
            <div key={category.name} className="exercise-category-bar">
              <div className="category-header">
                <span className="category-name">{category.name}</span>
                <span className="category-percentage">{category.percentage}%</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                    opacity: category.percentage > 0 ? 0.8 : 0.3
                  }}
                />
              </div>
              <div className="category-details">
                <span className="category-value">
                  {category.name === 'Aerobic' ? `${category.value} min` : `${category.value} sessions`}
                </span>
                <span className="category-goal">Goal: {category.description}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="summary-container">
          <div className="chart-summary">
            <h4>Week Summary</h4>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Aerobic Activity:</span>
                <span className="stat-value">{weeklyCategories.aerobic} minutes</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Strength Sessions:</span>
                <span className="stat-value">{weeklyCategories.strengthSessions} sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Balance Sessions:</span>
                <span className="stat-value">{weeklyCategories.flexibilitySessions} sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Goal Achievement:</span>
                <span className="stat-value">
                  {Object.values(categoryPercentages).filter(p => p >= 100).length}/3 categories
                </span>
              </div>
            </div>
          </div>
          
          {showThreeMonthSummaries && threeMonthWeeklyGoalsSummary && (
            <div className="chart-summary">
              <h4>3-Month Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Weeks Analyzed:</span>
                  <span className="stat-value">
                    {threeMonthWeeklyGoalsSummary.totalWeeks} weeks
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Weekly Goals Met:</span>
                  <span className="stat-value">
                    {threeMonthWeeklyGoalsSummary.weeksMetAllGoals} out of {threeMonthWeeklyGoalsSummary.totalWeeks} weeks
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Aerobic Goal Met:</span>
                  <span className="stat-value">
                    {threeMonthWeeklyGoalsSummary.weeksMetAerobicGoal} weeks
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Strength Goal Met:</span>
                  <span className="stat-value">
                    {threeMonthWeeklyGoalsSummary.weeksMetStrengthGoal} weeks
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Balance Goal Met:</span>
                  <span className="stat-value">
                    {threeMonthWeeklyGoalsSummary.weeksMetFlexibilityGoal} weeks
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
      <div className={`exercise-chart-container ${isExpanded ? 'expanded' : ''}`}>
        <div className="exercise-header">
          <h3 className="chart-title">Activity Breakdown by Type</h3>
          <h4 className="chart-subtitle">{nav.getFormattedDateRange()}</h4>
          
          {/* View Toggle - Hide for Physician (single view only), show for Patient and Admin */}
          {accessType !== 'Physician' && (
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${!showWeeklyGoals ? 'active' : ''}`}
                onClick={() => setShowWeeklyGoals(false)}
              >
                Activity Breakdown
              </button>
              <button 
                className={`toggle-btn ${showWeeklyGoals ? 'active' : ''}`}
                onClick={() => setShowWeeklyGoals(true)}
              >
                Weekly Goals
              </button>
            </div>
          )}
        </div>
        
        <svg 
          width="100%" 
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="exercise-svg"
        >
          <g className="y-axis">
            {yAxisLabels.map(value => {
              const y = config.padding.top + chartHeight - (value / maxDuration) * chartHeight;
              return (
                <g key={value} className="y-axis-grid-group">
                  <line className="chart-grid-line-horizontal" x1={config.padding.left} y1={y} x2={config.width - config.padding.right} y2={y} />
                  <text x={config.padding.left - 15} y={y + 3} fontSize={config.fontSize.yAxis} textAnchor="end" fill="var(--chart-color-text-secondary)" className="chart-tick-label">{value}</text>
                </g>
              );
            })}
            <text x={-(config.padding.top + chartHeight / 2)} y={config.padding.left / 2 - 5} fontSize={config.fontSize.yAxisTitle} textAnchor="middle" fill="var(--chart-color-text-primary)" transform="rotate(-90)" className="y-axis-title">Minutes</text>
          </g>

          <g className="x-axis">
            {daysOfWeek.map((day, dayIndex) => {
              const date = new Date(startOfWeek);
              date.setDate(date.getDate() + dayIndex);
              const x = config.padding.left + dayIndex * config.dayWidth + config.dayWidth / 2;

              const dayData = groupedData[day];
              const performedExercises = exerciseTypes.filter(type => (dayData[type.key] || 0) > 0);
              const emojis = performedExercises.map(type => type.emoji).join(' ');

              return (
                <g key={dayIndex} className="x-axis-label-group">
                  <line className="chart-grid-line-vertical" x1={config.padding.left + dayIndex * config.dayWidth} y1={config.padding.top} x2={config.padding.left + dayIndex * config.dayWidth} y2={config.height - config.padding.bottom} />
                  <text x={x} y={config.height - config.padding.bottom + 15} textAnchor="middle" fontSize={config.fontSize.dayLabel} fill="var(--chart-color-text-primary)" className="x-axis-day-label">{day}</text>
                  <text x={x} y={config.height - config.padding.bottom + 30} textAnchor="middle" fontSize={config.fontSize.dateLabel} fill="var(--chart-color-text-secondary)" className="x-axis-date-label">{date.getDate()}</text>
                  <text x={x} y={config.height - config.padding.bottom + 48} textAnchor="middle" fontSize={config.fontSize.emoji}>{emojis}</text>
                </g>
              );
            })}
          </g>

          <g className="data-bars">
            {daysOfWeek.map((day, dayIndex) => {
              const dayData = groupedData[day];
              const x = config.padding.left + dayIndex * config.dayWidth + config.dayWidth / 2;
              let currentY = config.height - config.padding.bottom;

              return (
                <g key={day}>
                  {exerciseTypes.map(type => {
                    const minutes = Number(dayData[type.key]) || 0;
                    if (minutes <= 0) return null;

                    const segmentHeight = (minutes / maxDuration) * chartHeight;
                    const segmentY = currentY - segmentHeight;

                    const segment = (
                      <g key={type.key}>
                        <rect
                          x={x - config.barWidth / 2}
                          y={segmentY}
                          width={config.barWidth}
                          height={segmentHeight}
                          fill={type.color}
                          className="data-bar"
                        >
                          <title>{`${type.label}: ${Math.round(minutes)} min`}</title>
                        </rect>
                        {/* Duration label inside the segment */}
                        {segmentHeight >= 12 && (
                          <text
                            x={x}
                            y={segmentY + segmentHeight / 2}
                            textAnchor="middle"
                            fontSize={isExpanded ? 8 : 6}
                            fill="black"
                            className="duration-label"
                          >
                            {Math.round(minutes)}
                          </text>
                        )}
                      </g>
                    );

                    currentY = segmentY;
                    return segment;
                  })}
                </g>
              );
            })}
          </g>
        </svg>
        
        <Legend 
          title="Exercise Type" 
          items={exerciseLegendItems} 
          orientation="horizontal" 
          size="medium" 
          hide={screenshotMode}
        />

        {/* Show summary for physician/unified view */}
        {weekSummary && (
          <div className="summary-container">
            <div className="chart-summary">
              <h4>Week Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Exercise:</span>
                  <span className="stat-value">
                    {weekSummary.totalMinutes} minutes
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Daily Average:</span>
                  <span className="stat-value">
                    {weekSummary.avgMinutesPerDay} minutes/day
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Exercise Days:</span>
                  <span className="stat-value">
                    {weekSummary.daysWithExercise}/7 days
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Most Common:</span>
                  <span className="stat-value">
                    {exerciseTypes.find(t => t.key === weekSummary.mostCommonExercise)?.emoji} {weekSummary.mostCommonExercise} ({weekSummary.mostCommonExerciseMinutes} min)
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Session:</span>
                  <span className="stat-value">
                    {weekSummary.avgSessionLength} minutes
                  </span>
                </div>
              </div>
            </div>
            
            {showThreeMonthSummaries && threeMonthSummary && (
              <div className="chart-summary">
                <h4>3-Month Summary</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Exercise:</span>
                    <span className="stat-value">
                      {threeMonthSummary.totalMinutes} minutes
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Daily Average:</span>
                    <span className="stat-value">
                      {threeMonthSummary.avgMinutesPerDay} minutes/day
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Exercise Days:</span>
                    <span className="stat-value">
                      {threeMonthSummary.daysWithExercise} days
                    </span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Most Common:</span>
                    <span className="stat-value">
                      {exerciseTypes.find(t => t.key === threeMonthSummary.mostCommonExercise)?.emoji} {threeMonthSummary.mostCommonExercise} ({threeMonthSummary.mostCommonExerciseMinutes} min)
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Session:</span>
                    <span className="stat-value">
                      {threeMonthSummary.avgSessionLength} minutes
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
};

export default ExerciseChart;
