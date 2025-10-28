/**
 PainChart.js - Pain Assessment and Visualization Component
 
 This component provides comprehensive pain monitoring:
 - Anatomical body mapping for pain location
 - Pain intensity scale (0-10) with color coding
 - Daily pain tracking and trend analysis
 - Interactive body diagram for pain location selection
 - Pain level input and editing capabilities
 - Navigation controls for time periods
 
 Critical for pain management and treatment monitoring.
 */

import React, { useState, useRef } from 'react';
import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';

import Legend from '../Legend';
import './PainChart.css';

import BodySVG from './BodySvg';

const PainChart = ({ patientId, isExpanded = false, onExpand, viewMode = 'patient', navigation, screenshotMode = false }) => {
  const { painData, isLoading: loading, error } = usePatientData(patientId, 'pain');
  const [useLineChart, setUseLineChart] = useState(false); // Toggle state for chart view
  
  // Use navigation from parent or fallback to internal navigation
  const useInternalNavigation = !navigation;
  const internalNavigation = useChartNavigation('pain');
  const nav = navigation || internalNavigation;

  const getPainColor = (level) => {
    // 11-class color scheme from light to dark
    const painColors = [
      '#ffffe5', // 0 - No pain (lightest cream)
      '#fff7bc', // 1 - Very mild pain
      '#f7f7b3', // 2 - Mild pain
      '#fee391', // 3 - Mild-moderate pain
      '#fec44f', // 4 - Moderate pain
      '#fe9929', // 5 - Moderate-severe pain
      '#ec7014', // 6 - Severe pain
      '#cc4c02', // 7 - Very severe pain
      '#b34703', // 8 - Extremely severe pain
      '#993404', // 9 - Most severe pain
      '#662506'  // 10 - Maximum pain (darkest brown)
    ];
    
    return painColors[Math.min(level, 10)];
  };

  const painLegendItems = Array.from({ length: 11 }, (_, i) => i).map(level => ({
    color: getPainColor(level),
    label: `${level}`,
  }));

  const { start: startOfWeek, end: endOfWeek } = nav.getDateRange();

  // Calculate previous and next week ranges
  const prevWeekStart = new Date(startOfWeek);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(prevWeekStart);
  prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
  prevWeekEnd.setHours(23, 59, 59, 999);

  const nextWeekStart = new Date(endOfWeek);
  nextWeekStart.setDate(nextWeekStart.getDate() + 1);
  nextWeekStart.setHours(0, 0, 0, 0);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
  nextWeekEnd.setHours(23, 59, 59, 999);

  const weekPainData = painData.filter(d => d.date >= startOfWeek && d.date <= endOfWeek);
  const prevWeekPainData = painData.filter(d => d.date >= prevWeekStart && d.date <= prevWeekEnd);
  const nextWeekPainData = painData.filter(d => d.date >= nextWeekStart && d.date <= nextWeekEnd);

  // Get 3-month data
  const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
  const threeMonthPainData = painData.filter(d => d.date >= startOfThreeMonths && d.date <= endOfThreeMonths);

  // Process data for chart
  let chartData = [];
  let mostCommonLocation = null;
  let averagePainLevel = 0;
  
  if (weekPainData.length > 0) {
    const dateMap = new Map();
    const locationCounts = new Map();

    weekPainData.forEach(item => {
      const dateKey = item.date.toDateString();
      dateMap.set(dateKey, item.level);
      
      const location = item.location.toLowerCase();
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
    });

    let mostCommon = null;
    let maxCount = 0;
    for (const [location, count] of locationCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = location;
      }
    }

    const data = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const dateKey = date.toDateString();
      const painLevel = dateMap.get(dateKey) || 0;
      
      data.push({
        date,
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        level: painLevel,
        color: getPainColor(painLevel)
      });
    }

    const totalPain = weekPainData.reduce((sum, item) => sum + item.level, 0);
    const avgPain = weekPainData.length > 0 ? (totalPain / weekPainData.length) : 0;

    chartData = data;
    mostCommonLocation = mostCommon;
    averagePainLevel = avgPain;
  }

  // Process data for extended chart (3 weeks)
  let extendedChartData = [];
  if (isExpanded) {

    // Combine all three weeks of data
    const allWeeksData = [...prevWeekPainData, ...weekPainData, ...nextWeekPainData];
    
    // Create a map of dates to pain levels for all 3 weeks
    const dateMap = new Map();
    allWeeksData.forEach(item => {
      const dateKey = item.date.toDateString();
      dateMap.set(dateKey, item.level);
    });

    // Generate chart data for all 21 days (3 weeks)
    const data = [];
    const weekLabels = ['Prev Week', 'Current Week', 'Next Week'];
    
    for (let week = 0; week < 3; week++) {
      const weekStart = week === 0 ? prevWeekStart : week === 1 ? startOfWeek : nextWeekStart;
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + day);
        const dateKey = date.toDateString();
        const painLevel = dateMap.get(dateKey) || 0;
        
        data.push({
          date,
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
          level: painLevel,
          color: getPainColor(painLevel),
          week: week,
          weekLabel: weekLabels[week]
        });
      }
    }

    extendedChartData = data;
  }

  // Calculate 3-month summary statistics for physician view
  let threeMonthSummary = null;
  if (threeMonthPainData.length > 0) {

    // Create a map of dates to pain levels for 3-month period
    const dateMap = new Map();
    const locationCounts = new Map();

    threeMonthPainData.forEach(item => {
      const dateKey = item.date.toDateString();
      dateMap.set(dateKey, item.level);
      
      // Count locations
      const location = item.location.toLowerCase();
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
    });

    // Find most common location
    let mostCommon = null;
    let maxCount = 0;
    for (const [location, count] of locationCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = location;
      }
    }

    const totalPain = threeMonthPainData.reduce((sum, item) => sum + item.level, 0);
    const avgPain = threeMonthPainData.length > 0 ? (totalPain / threeMonthPainData.length) : 0;

    // Calculate actual days in the 3-month period
    const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
    const daysInThreeMonths = Math.ceil((endOfThreeMonths - startOfThreeMonths) / (1000 * 60 * 60 * 24)) + 1;
    const daysWithPain = new Set(threeMonthPainData.map(d => d.date.toDateString())).size;

    // Calculate pain severity distribution
    const painLevelCounts = {};
    for (let i = 0; i <= 10; i++) {
      painLevelCounts[i] = 0;
    }
    threeMonthPainData.forEach(item => {
      painLevelCounts[item.level]++;
    });

    // Find most common pain level
    const mostCommonPainLevel = Object.entries(painLevelCounts)
      .sort(([,a], [,b]) => b - a)[0];

    threeMonthSummary = {
      totalEntries: threeMonthPainData.length,
      daysWithPain,
      daysInThreeMonths,
      mostCommonLocation: mostCommon,
      mostCommonLocationCount: maxCount,
      averagePainLevel: avgPain,
      mostCommonPainLevel: parseInt(mostCommonPainLevel[0]),
      mostCommonPainLevelCount: mostCommonPainLevel[1]
    };
  }

  const formatDateRange = (start, end) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} to ${endStr}`;
  };

  // Line Chart Component for Pain Ratings
  const PainLineChart = ({ data, isExpanded, extendedData }) => {
    const isExtendedView = isExpanded && extendedData && extendedData.length > 0;
    const chartData = isExtendedView ? extendedData : data;
    
    const config = {
      width: isExtendedView ? 900 : (isExpanded ? 600 : 400), // Wider for 3-week view
      height: isExpanded ? 220 : 150, // Reduced height since we removed week labels
      padding: { top: 20, right: 30, bottom: 50, left: 50 }, // Reduced bottom padding
      yAxisRange: 10,
      fontSize: {
        yAxis: isExpanded ? 10 : 8,
        xAxis: isExpanded ? 10 : 8,
      }
    };

    const chartWidth = config.width - config.padding.left - config.padding.right;
    const chartHeight = config.height - config.padding.top - config.padding.bottom;
    const dayWidth = chartWidth / (chartData.length - 1); // Dynamic based on data length

    // Create line path
    const linePath = chartData.map((point, index) => {
      const x = config.padding.left + (index * dayWidth);
      const y = config.padding.top + chartHeight - (point.level / config.yAxisRange) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <div className="pain-line-chart">
        <svg width="100%" height="100%" viewBox={`0 0 ${config.width} ${config.height}`}>
          {/* Grid lines */}
          {[0, 2, 4, 6, 8, 10].map(level => {
            const y = config.padding.top + chartHeight - (level / config.yAxisRange) * chartHeight;
            return (
              <g key={level}>
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
                  {level}
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

          {/* X-axis labels */}
          {chartData.map((point, index) => {
            const x = config.padding.left + (index * dayWidth);
            const showLabel = isExtendedView ? index % 7 === 0 : true; // Show every 7th day for extended view
            const dateStr = point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return (
              <g key={index}>
                {showLabel && (
                  <>
                    <text 
                      x={x} 
                      y={config.height - config.padding.bottom + 15} 
                      fontSize={config.fontSize.xAxis} 
                      textAnchor="middle" 
                      className="x-axis-day-label"
                    >
                      {point.day}
                    </text>
                    <text 
                      x={x} 
                      y={config.height - config.padding.bottom + 30} 
                      fontSize={config.fontSize.xAxis - 1} 
                      textAnchor="middle" 
                      className="x-axis-date-label"
                      fill="var(--chart-color-text-secondary)"
                    >
                      {dateStr}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Line */}
          <path 
            d={linePath} 
            stroke="var(--chart-color-primary)" 
            strokeWidth="3" 
            fill="none"
          />

          {/* Data points */}
          {chartData.map((point, index) => {
            const x = config.padding.left + (index * dayWidth);
            const y = config.padding.top + chartHeight - (point.level / config.yAxisRange) * chartHeight;
            return (
              <circle 
                key={index}
                cx={x} 
                cy={y} 
                r="4" 
                fill={point.color} 
                stroke="var(--chart-color-primary)" 
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const Body = ({ location, level }) => {
    const color = getPainColor(level);
    const locationLower = location.toLowerCase();

    return (
      <div className="body-container">
        <div className="body-views">
          <div className="body-view">
            <div className="body-view-label">Front</div>
            <BodySVG 
              className="body-svg" 
              painLocation={locationLower} 
              painColor={color} 
              view="front" 
            />
          </div>
          <div className="body-view">
            <div className="body-view-label">Back</div>
            <BodySVG 
              className="body-svg" 
              painLocation={locationLower} 
              painColor={color} 
              view="back" 
            />
          </div>
        </div>
      </div>
    );
  };

  if (viewMode === 'patient') {
    return (
      <div className="pain-chart-container">
        <div className="pain-chart-header">
          <h3 className="chart-title">Pain</h3>
          <h4 className="chart-subtitle">{nav.getFormattedDateRange()}</h4>
          
          {/* View Toggle */}
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${!useLineChart ? 'active' : ''}`}
              onClick={() => setUseLineChart(false)}
            >
              List View
            </button>
            <button 
              className={`toggle-btn ${useLineChart ? 'active' : ''}`}
              onClick={() => setUseLineChart(true)}
            >
              Line Chart
            </button>
          </div>
        </div>
        
        {/* Conditional Chart Rendering */}
        {useLineChart ? (
          <div className="pain-line-chart-container">
            <PainLineChart 
              data={chartData} 
              isExpanded={isExpanded} 
              extendedData={extendedChartData}
            />
            <div className="pain-legend-wrapper">
              <Legend title="Pain Intensity Scale (0-10)" items={painLegendItems} hide={screenshotMode} />
            </div>
          </div>
        ) : (
          <div className="pain-content-wrapper">
            <div className="pain-list">
              {weekPainData.length > 0 ? (
                weekPainData.map((item, index) => (
                  <div key={index} className="pain-list-item">
                    <div className="pain-item-info">
                      <div className="pain-item-date">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="pain-item-details">
                        <div className="pain-level">
                          <strong>Pain Level:</strong> {item.level}/10
                        </div>
                        <div className="pain-location">
                          <strong>Location:</strong> {item.location}
                        </div>
                      </div>
                    </div>
                    <div className="pain-item-body">
                      <Body location={item.location} level={item.level} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-pain-data">No pain data available for this week</div>
              )}
            </div>
            
            <div className="pain-legend-wrapper">
              <Legend title="Pain Intensity Scale (0-10)" items={painLegendItems} hide={screenshotMode} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Physician view
  return (
      <div className="physician-pain-chart-container">
        <div className="pain-line-chart-container">
          <h3 className="chart-title">Pain</h3>
          <h4 className="chart-subtitle">{nav.getFormattedDateRange()}</h4>
          <PainLineChart 
            data={chartData} 
            isExpanded={isExpanded} 
            extendedData={extendedChartData}
          />
        </div>

        <div className="pain-location-info">
          <h4>Pain Location: {mostCommonLocation || 'N/A'}</h4>
        </div>
        
        <div className="pain-legend-wrapper">
          <Legend title="Pain Intensity Scale (0-10)" items={painLegendItems} />
        </div>

        <div className="summary-container">
          <div className="chart-summary">
            <h4>Week Summary</h4>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Average Pain Intensity:</span>
                <span className="stat-value">{averagePainLevel.toFixed(1)}/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Most Common Location:</span>
                <span className="stat-value">{mostCommonLocation || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Days with Pain:</span>
                <span className="stat-value">{weekPainData.length}/7</span>
              </div>
            </div>
          </div>
          
          {threeMonthSummary && (
            <div className="chart-summary">
              <h4>3-Month Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Average Pain Intensity:</span>
                  <span className="stat-value">{threeMonthSummary.averagePainLevel.toFixed(1)}/10</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Most Common Location:</span>
                  <span className="stat-value">
                    {threeMonthSummary.mostCommonLocation || 'N/A'} ({threeMonthSummary.mostCommonLocationCount}x)
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Days with Pain:</span>
                  <span className="stat-value">
                    {threeMonthSummary.daysWithPain}/{threeMonthSummary.daysInThreeMonths}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default PainChart;
