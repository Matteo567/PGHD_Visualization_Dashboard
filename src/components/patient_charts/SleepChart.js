/*
 SleepChart.js - Sleep Pattern Monitoring Visualization
 
 This component provides sleep tracking with sleep duration and quality rating visualization. It includes weekly sleep pattern analysis with color-coded sleep quality indicators. It provides interactive tooltips with sleep details and includes navigation controls for time periods. It integrates with patient data and chart navigation. The component uses custom SVG for bar chart visualization and implements a sleep quality categorization system. It provides color-coded quality indicators for interpretation and supports expandable views. It implements time-based navigation and data filtering. Visualization features include a bar chart showing daily sleep duration, color-coded quality indicators for Very good, Fairly good, Fairly bad, and Very bad sleep quality, interactive tooltips with detailed sleep information, design that adapts to container size, and dynamic Y-axis scaling based on sleep duration range. Sleep quality categories include Very good for optimal sleep quality, Fairly good for good sleep quality, Fairly bad for poor sleep quality, and Very bad for very poor sleep quality. Clinical features include sleep duration tracking with recommended ranges, quality assessment based on subjective ratings, sleep consistency analysis, summary statistics for physician view, and trend analysis over time periods. Component structure includes a main SVG container with sizing for the chart container, duration scale with hour-based labeling on the Y-axis, day-of-week labels with date information on the X-axis, sleep duration bars with quality color coding for data bars, sleep quality explanations in the legend, and detailed sleep information on hover in tooltips. This component is used for sleep hygiene monitoring and sleep disorder assessment.
 */

import React, { useState } from 'react';

import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';
import Legend from '../Legend';
import './SleepChart.css';


const SleepChart = ({ patientId, isExpanded, onExpand, accessType = 'Admin', navigation, screenshotMode = false, showThreeMonthSummaries = false }) => {
  const { sleepData, loading, error } = usePatientData(patientId);
  // For Patient access, force Bar Chart (remove Line Chart access).
  // For Physician access, force Line Chart (remove Bar Chart access).
  // Admin can toggle between both.
  const shouldForceBarChart = accessType === 'Patient';
  const shouldForceLineChart = accessType === 'Physician';
  
  // Determine initial chart view based on access type
  let initialUseLineChart = false;
  if (shouldForceBarChart) {
    initialUseLineChart = false;
  } else if (shouldForceLineChart) {
    initialUseLineChart = true;
  }
  
  const [useLineChart, setUseLineChart] = useState(initialUseLineChart); // Toggle state for chart view
  
  // Use navigation from parent or fallback to internal navigation
  const internalNavigation = useChartNavigation('sleep');
  const nav = navigation || internalNavigation;

  const { start: startOfWeek, end: endOfWeek } = nav.getDateRange();
  const weekData = sleepData.filter(d => d.date >= startOfWeek && d.date <= endOfWeek);

  // Get previous week data
  const prevWeekStart = new Date(startOfWeek);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(startOfWeek);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
  const prevWeekData = sleepData.filter(d => d.date >= prevWeekStart && d.date <= prevWeekEnd);

  // Get next week data
  const nextWeekStart = new Date(endOfWeek);
  nextWeekStart.setDate(nextWeekStart.getDate() + 1);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
  const nextWeekData = sleepData.filter(d => d.date >= nextWeekStart && d.date <= nextWeekEnd);

  // Get 3-month data
  const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
  const threeMonthData = sleepData.filter(d => d.date >= startOfThreeMonths && d.date <= endOfThreeMonths);

  const qualityLevels = {
    'Very good': 'var(--chart-color-sleep-very-good)',
    'Fairly good': 'var(--chart-color-sleep-fairly-good)',
    'Fairly bad': 'var(--chart-color-sleep-fairly-bad)',
    'Very bad': 'var(--chart-color-sleep-very-bad)',
  };

  const getQualityColor = (quality) => qualityLevels[quality] || '#D3D3D3';

  const legendItems = Object.entries(qualityLevels).map(([label, color]) => ({
    label,
    color,
  }));

  // Process data for extended chart (3 weeks)
  let extendedChartData = [];
  if (isExpanded) {

    // Combine all three weeks of data
    const allWeeksData = [...prevWeekData, ...weekData, ...nextWeekData];
    
    // Create a map of dates to sleep data for all 3 weeks
    const dateMap = new Map();
    allWeeksData.forEach(item => {
      const dateKey = item.date.toDateString();
      dateMap.set(dateKey, item);
    });

    // Generate chart data for all 21 days (3 weeks)
    const data = [];
    const weekLabels = ['Prev Week', 'Current Week', 'Next Week'];
    const weekStarts = [prevWeekStart, startOfWeek, nextWeekStart];
    
    for (let week = 0; week < 3; week++) {
      const weekStart = weekStarts[week];
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + day);
        const dateKey = date.toDateString();
        const sleepData = dateMap.get(dateKey) || { hours: 0, quality: 'Very bad' };
        
        data.push({
          date,
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
          hours: sleepData.hours,
          quality: sleepData.quality,
          color: getQualityColor(sleepData.quality),
          week: week,
          weekLabel: weekLabels[week]
        });
      }
    }

    extendedChartData = data;
  }

  // Calculate summary statistics for physician view
  let weekSummary = null;
  if (weekData && weekData.length > 0) {

    const totalHours = weekData.reduce((sum, day) => sum + day.hours, 0);
    const avgHours = (totalHours / weekData.length).toFixed(1);

    // Count quality levels
    const qualityCounts = {};
    Object.keys(qualityLevels).forEach(quality => {
      qualityCounts[quality] = 0;
    });

    weekData.forEach(day => {
      if (qualityCounts[day.quality] !== undefined) {
        qualityCounts[day.quality]++;
      }
    });

    // Find most common quality
    const mostCommonQuality = Object.entries(qualityCounts)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate sleep consistency (how much variation in sleep hours)
    const hourVariations = weekData.map(day => Math.abs(day.hours - parseFloat(avgHours)));
    const avgVariation = (hourVariations.reduce((sum, v) => sum + v, 0) / hourVariations.length).toFixed(1);

    // Calculate average quality score using existing qualityCode from CSV data (0-3, where 0=Very good, 3=Very bad)
    // Fallback to quality string mapping if qualityCode is not available
    const qualityScores = {
      'Very good': 0,
      'Fairly good': 1,
      'Fairly bad': 2,
      'Very bad': 3
    };
    const avgQualityScore = weekData.reduce((sum, day) => {
      const code = day.qualityCode !== undefined ? day.qualityCode : (qualityScores[day.quality] || 0);
      return sum + code;
    }, 0) / weekData.length;
    const qualityAssessment = avgQualityScore <= 0.5 ? 'Good' : avgQualityScore <= 1.5 ? 'Fair' : 'Poor';
    
    // Map average score back to quality category (round to nearest) - lower scores are better
    const getQualityFromScore = (score) => {
      if (score <= 0.5) return 'Very good';
      if (score <= 1.5) return 'Fairly good';
      if (score <= 2.5) return 'Fairly bad';
      return 'Very bad';
    };
    const averageQuality = getQualityFromScore(avgQualityScore);

    // Count nights with adequate sleep (7+ hours)
    const adequateSleepNights = weekData.filter(day => day.hours >= 7).length;

    weekSummary = {
      totalHours: totalHours.toFixed(1),
      avgHours,
      mostCommonQuality: mostCommonQuality[0],
      mostCommonQualityCount: mostCommonQuality[1],
      avgVariation,
      qualityAssessment,
      adequateSleepNights,
      daysTracked: weekData.length,
      avgQualityScore: avgQualityScore.toFixed(2),
      averageQuality
    };
  }

  // Calculate 3-month summary statistics for physician view
  let threeMonthSummary = null;
  if (threeMonthData && threeMonthData.length > 0) {

    const totalHours = threeMonthData.reduce((sum, day) => sum + day.hours, 0);
    const avgHours = (totalHours / threeMonthData.length).toFixed(1);

    // Count quality levels
    const qualityCounts = {};
    Object.keys(qualityLevels).forEach(quality => {
      qualityCounts[quality] = 0;
    });

    threeMonthData.forEach(day => {
      if (qualityCounts[day.quality] !== undefined) {
        qualityCounts[day.quality]++;
      }
    });

    // Find most common quality
    const mostCommonQuality = Object.entries(qualityCounts)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate sleep consistency (how much variation in sleep hours)
    const hourVariations = threeMonthData.map(day => Math.abs(day.hours - parseFloat(avgHours)));
    const avgVariation = (hourVariations.reduce((sum, v) => sum + v, 0) / hourVariations.length).toFixed(1);

    // Calculate average quality score using existing qualityCode from CSV data (0-3, where 0=Very good, 3=Very bad)
    // Fallback to quality string mapping if qualityCode is not available
    const qualityScores = {
      'Very good': 0,
      'Fairly good': 1,
      'Fairly bad': 2,
      'Very bad': 3
    };
    const avgQualityScore = threeMonthData.reduce((sum, day) => {
      const code = day.qualityCode !== undefined ? day.qualityCode : (qualityScores[day.quality] || 0);
      return sum + code;
    }, 0) / threeMonthData.length;
    
    // Map average score back to quality category (round to nearest) - lower scores are better
    const getQualityFromScore = (score) => {
      if (score <= 0.5) return 'Very good';
      if (score <= 1.5) return 'Fairly good';
      if (score <= 2.5) return 'Fairly bad';
      return 'Very bad';
    };
    const averageQuality = getQualityFromScore(avgQualityScore);

    threeMonthSummary = {
      totalHours: totalHours.toFixed(1),
      avgHours,
      mostCommonQuality: mostCommonQuality[0],
      mostCommonQualityCount: mostCommonQuality[1],
      avgVariation,
      daysTracked: threeMonthData.length,
      avgQualityScore: avgQualityScore.toFixed(2),
      averageQuality
    };
  }

  // Line Chart Component for Sleep Duration
  const SleepLineChart = ({ data, isExpanded, extendedData }) => {
    const isExtendedView = isExpanded && extendedData && extendedData.length > 0;
    const chartData = isExtendedView ? extendedData : data;
    
    if (!chartData || chartData.length === 0) return null;

    const maxHours = chartData.length > 0 ? Math.max(...chartData.map(d => d.hours)) : 0;
    const minHours = 0; // Always start Y-axis at 0
    const range = Math.max(maxHours - minHours, 1); // Ensure minimum range of 1
    const padding = Math.max(range * 0.1, 0.5); // 10% padding, minimum 0.5
    
    const config = {
      width: isExtendedView ? 900 : (isExpanded ? 600 : 400), // Wider for 3-week view
      height: isExpanded ? 220 : 150, // Reduced height since we removed week labels
      padding: { top: 20, right: 30, bottom: 50, left: 50 }, // Reduced bottom padding
      fontSize: {
        yAxis: isExpanded ? 10 : 8,
        xAxis: isExpanded ? 10 : 8,
      }
    };

    const chartWidth = config.width - config.padding.left - config.padding.right;
    const chartHeight = config.height - config.padding.top - config.padding.bottom;
    const dayWidth = chartWidth / (chartData.length - 1); // Dynamic based on data length

    const getX = (index) => config.padding.left + (index * dayWidth);
    const getY = (hours) => config.padding.top + chartHeight - ((hours - minHours + padding) / (range + 2 * padding)) * chartHeight;

    const pathData = chartData.map((day, index) => {
      const x = getX(index);
      const y = getY(day.hours);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <div className="sleep-line-chart">
        <svg width="100%" height="100%" viewBox={`0 0 ${config.width} ${config.height}`}>
          {/* Grid lines */}
          {[0, 2, 4, 6, 8, 10, 12].map(hours => {
            if (hours > maxHours + padding) return null; // Don't show grid lines above data range
            const y = getY(hours);
            return (
              <g key={hours}>
                <line 
                  x1={config.padding.left} 
                  y1={y} 
                  x2={config.width - config.padding.right} 
                  y2={y} 
                  stroke="#e0e0e0" 
                  strokeWidth="1" 
                  strokeDasharray="2,2"
                />
                <text 
                  x={config.padding.left - 10} 
                  y={y + 3} 
                  fontSize={config.fontSize.yAxis} 
                  textAnchor="end" 
                  fill="var(--chart-color-text-secondary)"
                >
                  {hours}h
                </text>
              </g>
            );
          })}

          {/* Week separators for extended view */}
          {isExtendedView && [7, 14].map(weekIndex => {
            const x = config.padding.left + (weekIndex * dayWidth);
            return (
              <line 
                key={weekIndex}
                x1={x} 
                y1={config.padding.top} 
                x2={x} 
                y2={config.height - config.padding.bottom} 
                stroke="#ccc" 
                strokeWidth="2" 
                strokeDasharray="5,5"
              />
            );
          })}
          
          {/* Line path */}
          <path d={pathData} fill="none" stroke="#cccccc" strokeWidth="2" />
          
          {/* Data points */}
          {chartData.map((day, index) => {
            const x = getX(index);
            const y = getY(day.hours);
            const dateNum = day.date.getDate();
            const dayAbbr = day.day || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.date.getDay()];
            
            return (
              <g key={index}>
                <circle 
                  cx={x} 
                  cy={y} 
                  r="5" 
                  fill={getQualityColor(day.quality)}
                  stroke="#cccccc"
                  strokeWidth="2"
                />
                <text x={x} y={y - 15} fontSize="10" fill="#333" textAnchor="middle">
                  {day.hours.toFixed(1)}h
                </text>
                <text 
                  x={x} 
                  y={config.height - config.padding.bottom + 15} 
                  fontSize={config.fontSize.xAxis} 
                  textAnchor="middle" 
                  className="x-axis-day-label"
                >
                  {dayAbbr}
                </text>
                <text 
                  x={x} 
                  y={config.height - config.padding.bottom + 30} 
                  fontSize={config.fontSize.xAxis - 1} 
                  textAnchor="middle" 
                  className="x-axis-date-label"
                  fill="var(--chart-color-text-secondary)"
                >
                  {dateNum}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
      <div className="sleep-chart-content">
        <div className="sleep-header">
          <h3 className="chart-title">Sleep Quality & Duration</h3>
          <h4 className="chart-subtitle">{nav.getFormattedDateRange()}</h4>
          
          {/* View Toggle - Hide for Patient and Physician, show both for Admin */}
          {accessType === 'Admin' && (
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${!useLineChart ? 'active' : ''}`}
                onClick={() => setUseLineChart(false)}
              >
                Bar Chart
              </button>
              <button 
                className={`toggle-btn ${useLineChart ? 'active' : ''}`}
                onClick={() => setUseLineChart(true)}
              >
                Line Chart
              </button>
            </div>
          )}
        </div>
        
        {/* Conditional Chart Rendering */}
        {useLineChart ? (
          <SleepLineChart 
            data={weekData} 
            isExpanded={isExpanded} 
            extendedData={extendedChartData}
          />
        ) : (
          <div className="sleep-chart">
            {/* Sleep Quality Indicators Row */}
            <div className="sleep-quality-row">
              {weekData.map((day, index) => (
                <div key={`quality-${index}`} className="sleep-quality-item">
                  <div 
                    className="sleep-quality-indicator"
                    style={{ backgroundColor: getQualityColor(day.quality) }}
                  ></div>
                </div>
              ))}
            </div>
            
            {/* Bed Icons Row */}
            <div className="bed-icons-row">
              {weekData.map((day, index) => (
                <div key={`bed-${index}`} className="bed-item">
                  <div className="bed-icon-wrapper">
                    <svg viewBox="0 0 486.5 225.1" className="bed-icon">
                      <path d="M471.9,68.9c-8,0-14.5,6.5-14.5,14.5v68.6H26.1l-.6-139.3c0-7-5.8-12.7-12.8-12.7h0C5.7,0,0,5.7,0,12.8v199.6c0,7,5.7,12.8,12.7,12.8s12.8-5.7,12.8-12.8v-37h431.9v35.2c0,8,6.5,14.5,14.5,14.5s14.5-6.5,14.5-14.5v-127.1c0-8-6.5-14.5-14.5-14.5ZM483.7,210.6c0,6.5-5.3,11.8-11.8,11.8s-11.8-5.3-11.8-11.8v-38H22.7v39.7c0,5.5-4.5,10-10,10s-10-4.5-10-10V12.8C2.8,7.3,7.3,2.8,12.7,2.8h0c5.5,0,9.9,4.5,10,9.9l.6,142.1h436.8v-71.4c0-6.5,5.3-11.7,11.8-11.7s11.8,5.3,11.8,11.7v127.1Z" fill="#D2B48C"/>
                      <path d="M29.9,94.2v54.5h425.4v-54.5H29.9ZM452.5,145.9H32.7v-48.9h419.8v48.9Z" fill="#e0e0e0"/>
                      <rect x="32.7" y="97" width={`${(day.hours / 10) * 419.8}`} height="48.9" fill="#FF4500" className="sleep-fill-rect" />
                      <path d="M112.8,46.3h-55.4c-12.1,0-22,9.9-22,22s9.9,22,22,22h55.4c12.1,0,22-9.9,22-22s-9.9-22-22-22ZM112.8,87.5h-55.4c-10.6,0-19.2-8.6-19.2-19.2s8.6-19.2,19.2-19.2h55.4c10.6,0,19.2,8.6,19.2,19.2s-8.6,19.2-19.2,19.2Z" fill="#FFFFFF" stroke="#AAAAAA" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Sleep Information Row */}
            <div className="sleep-info-row">
              {weekData.map((day, index) => (
                <div key={`info-${index}`} className="sleep-info-item">
                  <div className="sleep-hours">{day.hours.toFixed(1)}h</div>
                  <div className="day-label">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(() => {
                    const date = new Date(day.date);
                    return !isNaN(date.getTime()) ? date.getDay() : 0;
                  })()]}</div>
                  <div className="date-label">{(() => {
                    const date = new Date(day.date);
                    return !isNaN(date.getTime()) ? date.getDate() : 'Invalid';
                  })()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Legend title="Sleep Quality" items={legendItems} hide={screenshotMode} />

        {/* Show summary for physician/unified view */}
        {weekSummary && (
          <div className="summary-container">
            <div className="chart-summary">
              <h4>Week Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Average Sleep:</span>
                  <span className="stat-value">
                    {weekSummary.avgHours} hours/night
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Sleep:</span>
                  <span className="stat-value">
                    {weekSummary.totalHours} hours
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Sleep Consistency:</span>
                  <span className="stat-value">
                    ±{weekSummary.avgVariation} hours variation
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Average Quality:</span>
                  <span className="stat-value">
                    {weekSummary.averageQuality}
                  </span>
                </div>

              </div>
            </div>
            
            {showThreeMonthSummaries && threeMonthSummary && (
              <div className="chart-summary">
                <h4>3-Month Summary</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Average Sleep:</span>
                    <span className="stat-value">
                      {threeMonthSummary.avgHours} hours/night
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Sleep:</span>
                    <span className="stat-value">
                      {threeMonthSummary.totalHours} hours
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Sleep Consistency:</span>
                    <span className="stat-value">
                      ±{threeMonthSummary.avgVariation} hours variation
                    </span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Average Quality:</span>
                    <span className="stat-value">
                      {threeMonthSummary.averageQuality}
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

export default SleepChart;
