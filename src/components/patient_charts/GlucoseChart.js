/*
 GlucoseChart.js - Blood Glucose Monitoring Visualization
 
 This component provides blood glucose tracking with time-based glucose readings that include meal context for pre and post meal readings. It uses range-based color coding to indicate whether readings are below, in, or above target range. It provides daily and weekly trend visualization with interactive tooltips that show detailed glucose information. It includes navigation controls for time periods and integrates with patient data and chart navigation. This component is used for diabetes management and glucose trend analysis.
 */

import React, { useState, useRef } from 'react';
import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';
import Legend from '../Legend';
import InfoBox from '../InfoBox';
import Tooltip from '../ui/Tooltip';
import SharedYAxis from '../chart-utils/SharedYAxis';
import './GlucoseChart.css';

// --- Constants ---
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RANGE_COLORS = {
  'below range': 'var(--chart-color-secondary)', // Purple
  'in range': 'var(--chart-color-good)', // Green
  'above range': 'var(--chart-color-blue)', // Orange (despite the name, this is actually orange)
};

// --- Helper Functions ---
const getPointColor = (range) => RANGE_COLORS[range.toLowerCase()] || RANGE_COLORS['in range'];
const isPreMeal = (measurementType) => measurementType === 'Pre meal';
const getTimePosition = (date, dayIndex, config) => {
  const timeInHours = date.getHours() + date.getMinutes() / 60;
  const timeRatio = timeInHours / 24;
  const dayStart = config.padding.left + dayIndex * config.dayWidth;
  return dayStart + (timeRatio * (config.dayWidth - 10)) + 5;
};

// --- Chart Sub-components ---
const XAxisAndGrid = ({ config, startOfWeek }) => (
  <g className="x-axis-grid">
    {DAYS_OF_WEEK.map((day, i) => {
      const x = config.padding.left + i * config.dayWidth;
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      
      // Tick positions
      const startTickX = x;
      const middleTickX = x + config.dayWidth / 2;
      
      return (
        <g key={i}>
          {/* Vertical grid line */}
          <line className="chart-grid-line-vertical" x1={x} y1={config.padding.top} x2={x} y2={config.height - config.padding.bottom} />
          
          {/* X-axis tick marks */}
          <line 
            className="x-axis-tick" 
            x1={startTickX} 
            y1={config.height - config.padding.bottom} 
            x2={startTickX} 
            y2={config.height - config.padding.bottom + 5}
            stroke="var(--chart-color-neutral)"
            strokeWidth="1"
          />
          <line 
            className="x-axis-tick" 
            x1={middleTickX} 
            y1={config.height - config.padding.bottom} 
            x2={middleTickX} 
            y2={config.height - config.padding.bottom + 5}
            stroke="var(--chart-color-neutral)"
            strokeWidth="1"
          />
          
          {/* Time labels positioned at tick marks */}
          <text 
            className="time-label" 
            x={startTickX} 
            y={config.height - config.padding.bottom + 15} 
            textAnchor="middle"
            fontSize={config.fontSize.timeLabel}
            style={{fontSize: '8px'}}
          >
            12a
          </text>
          <text 
            className="time-label" 
            x={middleTickX} 
            y={config.height - config.padding.bottom + 15} 
            textAnchor="middle"
            fontSize={config.fontSize.timeLabel}
            style={{fontSize: '8px'}}
          >
            12p
          </text>
          
          {/* Day and date labels */}
                    <text 
            className="x-axis-day-label"
            x={x + config.dayWidth / 2} 
            y={config.height - config.padding.bottom + 40} 
            textAnchor="middle"
            fontSize={config.fontSize.dayLabel}
            style={{fontSize: '8px'}}
          >
            {day}
          </text>
          <text 
            className="x-axis-date-label" 
            x={x + config.dayWidth / 2} 
            y={config.height - config.padding.bottom + 58} 
            textAnchor="middle"
            fontSize={config.fontSize.dateLabel}
            style={{fontSize: '8px'}}
          >
            {currentDay.getDate()}
          </text>
        </g>
      );
    })}
    {/* Final tick mark at the end of the last day */}
    <line 
      className="x-axis-tick" 
      x1={config.padding.left + DAYS_OF_WEEK.length * config.dayWidth} 
      y1={config.height - config.padding.bottom} 
      x2={config.padding.left + DAYS_OF_WEEK.length * config.dayWidth} 
      y2={config.height - config.padding.bottom + 5}
      stroke="#666"
      strokeWidth="1"
    />
    <text 
      className="time-label" 
      x={config.padding.left + DAYS_OF_WEEK.length * config.dayWidth} 
      y={config.height - config.padding.bottom + 15} 
      textAnchor="middle"
      fontSize={config.fontSize.timeLabel}
      style={{fontSize: '8px'}}
    >
      12a
    </text>
  </g>
);

const DataPoints = ({ weekData, config, onBarHover, onBarLeave }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  return (
    <g className="data-points">
      {weekData.map((reading, index) => {
        const dayIndex = reading.date.getDay();
        const x = getTimePosition(reading.date, dayIndex, config);
        const y = config.padding.top + chartHeight - (reading.value / config.yAxisRange) * chartHeight;
        const color = getPointColor(reading.range);
        const isPre = isPreMeal(reading.measurementType);
        
        const handleMouseEnter = (event) => {
          const tooltipData = {
            value: reading.value,
            unit: 'mmol/L',
            range: reading.range,
            measurementType: reading.measurementType,
            time: reading.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            date: reading.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            position: { x: event.clientX, y: event.clientY }
          };
          onBarHover(tooltipData);
        };

        const handleMouseLeave = () => {
          onBarLeave();
        };
        
        return (
          <rect
            key={index}
            x={x - config.barWidth / 2}
            y={y}
            width={config.barWidth}
            height={(reading.value / config.yAxisRange) * chartHeight}
            fill={isPre ? 'none' : color}
            stroke={color}
            strokeWidth={isPre ? 2 : 1}
            style={{ cursor: 'pointer' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </g>
  );
};

const Chart = ({ weekData, isExpanded, startOfWeek, onBarHover, onBarLeave, monthLabel }) => {
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
        },
        barWidth: 12,
        yAxisLabels: [0, 4, 8, 12],
        yAxisRange: 12,
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
        },
        barWidth: 8,
        yAxisLabels: [0, 4, 8, 12],
        yAxisRange: 12,
      };
  
  return (
    <div className="glucose-svg-container">
      <h3 className="chart-title">Blood Glucose</h3>
      {monthLabel && <h4 className="chart-subtitle">{monthLabel}</h4>}
      <svg width="100%" height="100%" viewBox={`0 0 ${config.width} ${config.height}`} className="glucose-svg">
        <rect width={config.width} height={config.height} fill="white" />
        <XAxisAndGrid config={config} startOfWeek={startOfWeek} />
        <SharedYAxis config={config} title="mmol/L" />
        <DataPoints weekData={weekData} config={config} onBarHover={onBarHover} onBarLeave={onBarLeave} />
      </svg>
    </div>
  );
};

// --- Main Component ---
const GlucoseChart = ({ patientId, isExpanded = false, onExpand, accessType = 'Admin', navigation, screenshotMode = false, showThreeMonthSummaries = false }) => {
  const healthRangeLegendItems = [
    { label: 'Above range', color: RANGE_COLORS['above range'] },
    { label: 'In range', color: RANGE_COLORS['in range'] },
    { label: 'Below range', color: RANGE_COLORS['below range'] }
  ];

  const mealTimeLegendItems = [
    { 
      label: 'Pre-meal', 
      shape: 'outlined',
      shapeStyle: { borderColor: 'var(--chart-color-text-secondary)' },
      description: 'Blood glucose measurements taken before meals'
    },
    { 
      label: 'Post-meal', 
      shape: 'filled',
      shapeStyle: { backgroundColor: 'var(--chart-color-text-secondary)' },
      description: 'Blood glucose measurements taken after meals'
    },
  ];
  const { glucoseData, loading, error } = usePatientData(patientId);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Use navigation from parent or fallback to internal navigation
  const internalNavigation = useChartNavigation('glucose');
  const nav = navigation || internalNavigation;



  const { start: startOfWeek, end: endOfWeek } = nav.getDateRange();
  const weekData = glucoseData.filter(d => d.date >= startOfWeek && d.date <= endOfWeek);

  // Get 3-month data
  const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
  const threeMonthData = glucoseData.filter(d => d.date >= startOfThreeMonths && d.date <= endOfThreeMonths);

  // Calculate summary statistics for week period
  // This calculates averages, range percentages, and reading counts
  let weekSummary = null;
  if (weekData.length > 0) {
    // Filter to get only valid readings (value > 0)
    const readings = weekData.filter(d => d.value && d.value > 0);
    
    // Separate readings by meal timing (pre-meal vs post-meal)
    const preMealReadings = readings.filter(d => d.measurementType === 'Pre meal');
    const postMealReadings = readings.filter(d => d.measurementType === 'Post meal');

    // Calculate average glucose: sum all values, divide by count, round to 1 decimal
    const avgGlucose = readings.length > 0 ? 
      (readings.reduce((sum, val) => sum + val.value, 0) / readings.length).toFixed(1) : 0;
    
    // Calculate average for pre-meal readings only
    const avgPreMeal = preMealReadings.length > 0 ? 
      (preMealReadings.reduce((sum, val) => sum + val.value, 0) / preMealReadings.length).toFixed(1) : 0;
    
    // Calculate average for post-meal readings only
    const avgPostMeal = postMealReadings.length > 0 ? 
      (postMealReadings.reduce((sum, val) => sum + val.value, 0) / postMealReadings.length).toFixed(1) : 0;

    // Count readings in each range category
    const highReadings = readings.filter(d => d.range.toLowerCase() === 'above range').length;
    const lowReadings = readings.filter(d => d.range.toLowerCase() === 'below range').length;
    const inRangeReadings = readings.filter(d => d.range.toLowerCase() === 'in range').length;

    // Calculate what percentage of readings were in the target range
    const rangePercentage = readings.length > 0 ? 
      ((inRangeReadings / readings.length) * 100).toFixed(0) : 0;

    // Count unique days that had readings
    const daysWithReadings = new Set(weekData.map(d => d.date.toDateString())).size;

    weekSummary = {
      avgGlucose,
      avgPreMeal,
      avgPostMeal,
      highReadings,
      lowReadings,
      inRangeReadings,
      rangePercentage,
      daysWithReadings,
      totalReadings: readings.length
    };
  }

  // Calculate 3-month summary (same logic as week summary, just different data)
  let threeMonthSummary = null;
  if (threeMonthData.length > 0) {
    const readings = threeMonthData.filter(d => d.value && d.value > 0);
    const preMealReadings = readings.filter(d => d.measurementType === 'Pre meal');
    const postMealReadings = readings.filter(d => d.measurementType === 'Post meal');

    const avgGlucose = readings.length > 0 ? 
      (readings.reduce((sum, val) => sum + val.value, 0) / readings.length).toFixed(1) : 0;
    
    const avgPreMeal = preMealReadings.length > 0 ? 
      (preMealReadings.reduce((sum, val) => sum + val.value, 0) / preMealReadings.length).toFixed(1) : 0;
    
    const avgPostMeal = postMealReadings.length > 0 ? 
      (postMealReadings.reduce((sum, val) => sum + val.value, 0) / postMealReadings.length).toFixed(1) : 0;

    const highReadings = readings.filter(d => d.range.toLowerCase() === 'above range').length;
    const lowReadings = readings.filter(d => d.range.toLowerCase() === 'below range').length;
    const inRangeReadings = readings.filter(d => d.range.toLowerCase() === 'in range').length;

    const rangePercentage = readings.length > 0 ? 
      ((inRangeReadings / readings.length) * 100).toFixed(0) : 0;

    const daysWithReadings = new Set(threeMonthData.map(d => d.date.toDateString())).size;

    threeMonthSummary = {
      avgGlucose,
      avgPreMeal,
      avgPostMeal,
      highReadings,
      lowReadings,
      inRangeReadings,
      rangePercentage,
      daysWithReadings,
      totalReadings: readings.length
    };
  }


  const handleBarHover = (data) => {
    setTooltipData(data);
    setTooltipPosition(data.position);
  };

  const handleBarLeave = () => {
    setTooltipData(null);
  };

  return (
    <>
      <div className="glucose-chart-container" ref={containerRef}>
        <div className={`glucose-chart-wrapper ${isExpanded ? 'expanded' : ''}`}>
                  <Chart 
          weekData={weekData} 
          isExpanded={isExpanded} 
          startOfWeek={startOfWeek} 
          onBarHover={handleBarHover} 
          onBarLeave={handleBarLeave} 
          monthLabel={nav.getFormattedDateRange()}
        />
        </div>
        <div className="glucose-legends-wrapper">
          <Legend title="Health Range" items={healthRangeLegendItems} hide={screenshotMode} />
          <Legend title="Prandial State" items={mealTimeLegendItems} hide={screenshotMode} />
        </div>
        
        {/* Show InfoBox and summary for unified view - Hide InfoBox for Physician but keep summaries */}
        {weekSummary ? (
          <>
            {/* Hide InfoBox for Physician */}
            {accessType !== 'Physician' && (
              <InfoBox 
                title="Blood Glucose Information"
                content="For pre-prandial (before meals) blood sugar, the target range is 4.0 to 7.0 mmol/L. A reading within this range is considered in range. A reading below 4.0 mmol/L is below range, while a reading above 7.0 mmol/L is out of range. For 2-hour post-prandial (after eating) blood sugar, the target range is 5.0 to 10.0 mmol/L. A reading within this range is considered in range. A reading below 5.0 mmol/L is below range, while a reading above 10.0 mmol/L is out of range (Diabetes Canada)."
              />
            )}
            {/* Always show summaries for physician/unified view */}
            <div className="summary-container">
              <div className="chart-summary">
                <h4>Week Summary</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Average Glucose:</span>
                    <span className="stat-value">
                      {weekSummary.avgGlucose} mmol/L
                    </span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Readings In Range:</span>
                    <span className="stat-value">
                      {weekSummary.rangePercentage}% ({weekSummary.inRangeReadings}/{weekSummary.totalReadings})
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">High/Low Readings:</span>
                    <span className="stat-value">
                      {weekSummary.highReadings} high, {weekSummary.lowReadings} low
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Reading Days:</span>
                    <span className="stat-value">
                      {weekSummary.daysWithReadings}/7 days
                    </span>
                  </div>
                </div>
              </div>
              
              {showThreeMonthSummaries && threeMonthSummary && (
                <div className="chart-summary">
                  <h4>3-Month Summary</h4>
                  <div className="summary-stats">
                    <div className="stat-item">
                      <span className="stat-label">Average Glucose:</span>
                      <span className="stat-value">
                        {threeMonthSummary.avgGlucose} mmol/L
                      </span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-label">Readings In Range:</span>
                      <span className="stat-value">
                        {threeMonthSummary.rangePercentage}% ({threeMonthSummary.inRangeReadings}/{threeMonthSummary.totalReadings})
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">High/Low Readings:</span>
                      <span className="stat-value">
                        {threeMonthSummary.highReadings} high, {threeMonthSummary.lowReadings} low
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Reading Days:</span>
                      <span className="stat-value">
                        {threeMonthSummary.daysWithReadings} days
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          accessType !== 'Physician' && (
            <InfoBox 
              title="Blood Glucose Information"
              content="For pre-prandial (before meals) blood sugar, the target range is 4.0 to 7.0 mmol/L. A reading within this range is considered in range. A reading below 4.0 mmol/L is below range, while a reading above 7.0 mmol/L is out of range. For 2-hour post-prandial (after eating) blood sugar, the target range is 5.0 to 10.0 mmol/L. A reading within this range is considered in range. A reading below 5.0 mmol/L is below range, while a reading above 10.0 mmol/L is out of range."
            />
          )
        )}
      </div>
      
      {/* Custom Tooltip */}
      <Tooltip
        isVisible={!!tooltipData}
        content={tooltipData && (
          <div>
            <div className="tooltip-title">Blood Glucose</div>
            <div className="tooltip-value">{tooltipData.value} {tooltipData.unit}</div>
            <div className={`tooltip-range ${tooltipData.range.toLowerCase().replace(' ', '-')}`}>
              {tooltipData.range}
            </div>
            <div className="tooltip-time">{tooltipData.measurementType} - {tooltipData.time}</div>
            <div className="tooltip-date">{tooltipData.date}</div>
          </div>
        )}
        position={tooltipPosition}
      />
    </>
  );
};

export default GlucoseChart;
