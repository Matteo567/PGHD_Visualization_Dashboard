/*
 BloodPressureChart.js - Blood Pressure Monitoring Visualization
 
 This component provides comprehensive blood pressure tracking:
 - Systolic and diastolic pressure visualization
 - Risk categorization with color coding
 - Daily and weekly trend analysis
 - Multiple daily measurements display
 - Interactive tooltips with BP details
 - Navigation controls for time periods
 
 ARCHITECTURE:
 - Uses custom SVG for precise blood pressure visualization
 - Implements dual-axis system for systolic and diastolic values
 - Provides risk-based color coding for clinical interpretation
 - Supports multiple daily readings with time-based positioning
 - Implements configurable layouts
 
 Visualization Features:
 - Dual-line chart showing systolic and diastolic trends
 - Color-coded risk categories (normal, elevated, high, crisis)
 - Time-based positioning for multiple daily readings
 - Interactive tooltips with detailed BP information
 - Grid system with proper axis scaling
 
 Clinical Features:
 - Risk categorization based on medical guidelines
 - Summary statistics for physician view
 - Trend analysis over time periods
 - Educational information for patient view
 
 Component Structure:
 - Y-Axis: Dual-axis system for systolic and diastolic values
 - X-Axis: Time-based axis with day and time labels
 - DataPoints: Interactive blood pressure readings
 - Legend: Risk category explanations
 - Tooltip: Detailed reading information
 
 Critical for cardiovascular health monitoring and hypertension management.
 */

import React, { useState, useRef, useLayoutEffect } from 'react';
import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';
import Legend from '../Legend';
import InfoBox from '../InfoBox';
import Tooltip from '../ui/Tooltip';
import './BloodPressureChart.css';

// Constants
const TIME_LABELS = ['12a', '12p', '12a'];
const TIME_HOURS = [0, 12, 24];

// Helper Functions
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const formatDayLabel = (date) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[date.getDay()];
};

const getTimePosition = (date, dayIndex, config) => {
  const hour = date.getHours() + date.getMinutes() / 60;
  const timeRatio = hour / 24;
  const dayContentWidth = config.dayWidth - config.dayPadding * 2;
  return config.padding.left + (dayIndex * config.dayWidth) + config.dayPadding + (timeRatio * dayContentWidth);
};

// Chart Sub-components

const YAxis = ({ config, type }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  const yAxisLabels = config.yAxisLabels[type];
  const valueRange = config.yAxisRange[type];
  const yOffset = config.yAxisOffset[type];

  return (
    <g className="y-axis">
      <text
        x={config.padding.left / 3}
        y={config.padding.top + chartHeight / 2}
        fontSize={config.fontSize.yAxisTitle}
        textAnchor="middle"
        className="y-axis-title"
        transform={`rotate(-90, ${config.padding.left / 3}, ${config.padding.top + chartHeight / 2})`}
      >
        mm Hg
      </text>
      {yAxisLabels.map(value => {
        const y = config.height - config.padding.bottom - ((value - yOffset) / valueRange) * chartHeight;
        return (
          <g key={value} className="y-axis-grid-group">
                        <line className="chart-grid-line-horizontal" x1={config.padding.left} y1={y} x2={config.width - config.padding.right} y2={y} />
            <text x={config.padding.left - 10} y={y + 3} fontSize={config.fontSize.yAxis} textAnchor="end" className="chart-tick-label">{value}</text>
          </g>
        );
      })}
    </g>
  );
};

// Blood Pressure Range Background Component
const BPRangeBackground = ({ config }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  const systolicRange = config.yAxisRange.systolic;
  const diastolicRange = config.yAxisRange.diastolic;
  const systolicOffset = config.yAxisOffset.systolic;
  const diastolicOffset = config.yAxisOffset.diastolic;

  // Define BP ranges (systolic/diastolic)
  const ranges = [
    { 
      name: 'High', 
      systolic: [140, 200], 
      diastolic: [90, 120], 
      color: 'var(--chart-color-orange)', 
      opacity: 0.1 
    },
    { 
      name: 'Pre-high', 
      systolic: [120, 140], 
      diastolic: [80, 90], 
      color: 'var(--chart-color-yellow)', 
      opacity: 0.1 
    },
    { 
      name: 'Ideal', 
      systolic: [90, 120], 
      diastolic: [60, 80], 
      color: 'var(--chart-color-blue)', 
      opacity: 0.1 
    },
    { 
      name: 'Low', 
      systolic: [0, 90], 
      diastolic: [0, 60], 
      color: 'var(--chart-color-danger)', 
      opacity: 0.1 
    }
  ];

  return (
    <g className="bp-range-background">
      {ranges.map((range, index) => {
        // Calculate Y positions for systolic range
        const systolicTopY = config.height - config.padding.bottom - 
          ((range.systolic[1] - systolicOffset) / systolicRange) * chartHeight;
        const systolicBottomY = config.height - config.padding.bottom - 
          ((range.systolic[0] - systolicOffset) / systolicRange) * chartHeight;
        
        // Calculate Y positions for diastolic range  
        const diastolicTopY = config.height - config.padding.bottom - 
          ((range.diastolic[1] - diastolicOffset) / diastolicRange) * chartHeight;
        const diastolicBottomY = config.height - config.padding.bottom - 
          ((range.diastolic[0] - diastolicOffset) / diastolicRange) * chartHeight;

        // Create overlapping rectangles for the range
        return (
          <g key={range.name}>
            {/* Systolic range background */}
            <rect
              x={config.padding.left}
              y={Math.min(systolicTopY, systolicBottomY)}
              width={config.width - config.padding.left - config.padding.right}
              height={Math.abs(systolicBottomY - systolicTopY)}
              fill={range.color}
              opacity={range.opacity}
              className={`bp-range-${range.name.toLowerCase()}`}
            />
            {/* Diastolic range background */}
            <rect
              x={config.padding.left}
              y={Math.min(diastolicTopY, diastolicBottomY)}
              width={config.width - config.padding.left - config.padding.right}
              height={Math.abs(diastolicBottomY - diastolicTopY)}
              fill={range.color}
              opacity={range.opacity}
              className={`bp-range-${range.name.toLowerCase()}`}
            />
          </g>
        );
      })}
    </g>
  );
};

// New Dual Y-Axis Component for Combined Chart
const DualYAxis = ({ config }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  const systolicLabels = config.yAxisLabels.systolic;
  const diastolicLabels = config.yAxisLabels.diastolic;
  const systolicRange = config.yAxisRange.systolic;
  const diastolicRange = config.yAxisRange.diastolic;
  const systolicOffset = config.yAxisOffset.systolic;
  const diastolicOffset = config.yAxisOffset.diastolic;

  return (
    <g className="dual-y-axis">
      {/* Systolic Y-Axis (Left) */}
      <g className="y-axis-left">
        <text
          x={config.padding.left / 3}
          y={config.padding.top + chartHeight / 2}
          fontSize={config.fontSize.yAxisTitle}
          textAnchor="middle"
          className="y-axis-title"
          transform={`rotate(-90, ${config.padding.left / 3}, ${config.padding.top + chartHeight / 2})`}
        >
          Systolic (mmHg)
        </text>
        {systolicLabels.map(value => {
          const y = config.height - config.padding.bottom - ((value - systolicOffset) / systolicRange) * chartHeight;
          return (
            <g key={`systolic-${value}`} className="y-axis-grid-group">
              <line className="chart-grid-line-horizontal" x1={config.padding.left} y1={y} x2={config.width - config.padding.right} y2={y} />
              <text 
                x={config.padding.left - 10} 
                y={y + 3} 
                fontSize={config.fontSize.yAxis} 
                textAnchor="end" 
                className="chart-tick-label systolic-label"
                fill="black"
              >
                {value}
              </text>
            </g>
          );
        })}
      </g>

      {/* Diastolic Y-Axis (Right) */}
      <g className="y-axis-right">
        <text
          x={config.width - config.padding.right / 3}
          y={config.padding.top + chartHeight / 2}
          fontSize={config.fontSize.yAxisTitle}
          textAnchor="middle"
          className="y-axis-title"
          transform={`rotate(90, ${config.width - config.padding.right / 3}, ${config.padding.top + chartHeight / 2})`}
        >
          Diastolic (mmHg)
        </text>
        {diastolicLabels.map(value => {
          const y = config.height - config.padding.bottom - ((value - diastolicOffset) / diastolicRange) * chartHeight;
          return (
            <g key={`diastolic-${value}`} className="y-axis-grid-group">
              <text 
                x={config.width - config.padding.right + 10} 
                y={y + 3} 
                fontSize={config.fontSize.yAxis} 
                textAnchor="start" 
                className="chart-tick-label diastolic-label"
                fill="var(--chart-color-green)"
              >
                {value}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
};

const XAxis = ({ config, weekDays }) => (
  <g className="x-axis">
    {weekDays.map((day, dayIndex) => {
      const dayX = config.padding.left + dayIndex * config.dayWidth;
      const dayCenterX = dayX + config.dayWidth / 2;
      
      // Tick positions
      const startTickX = dayX;
      const middleTickX = dayX + config.dayWidth / 2;

      return (
        <g key={dayIndex} className="x-axis-label-group">
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

          {/* Day and Date Labels */}
          <text
            x={dayCenterX}
            y={config.height - config.padding.bottom + 35}
            textAnchor="middle"
            className="x-axis-day-label"
            fontSize={config.fontSize.dayLabel}
            style={{fontSize: '8px'}}
          >
            {formatDayLabel(day)}
          </text>
          <text
            x={dayCenterX}
            y={config.height - config.padding.bottom + 52}
            textAnchor="middle"
            className="x-axis-date-label"
            fontSize={config.fontSize.dateLabel}
            style={{fontSize: '8px'}}
          >
            {day.getDate()}
          </text>
        </g>
      );
    })}
    {/* Final tick mark at the end of the last day */}
    <line 
      className="x-axis-tick" 
      x1={config.padding.left + weekDays.length * config.dayWidth} 
      y1={config.height - config.padding.bottom} 
      x2={config.padding.left + weekDays.length * config.dayWidth} 
      y2={config.height - config.padding.bottom + 5}
      stroke="var(--chart-color-neutral)"
      strokeWidth="1"
    />
    <text
      className="time-label"
      x={config.padding.left + weekDays.length * config.dayWidth}
      y={config.height - config.padding.bottom + 15}
      textAnchor="middle"
      fontSize={config.fontSize.timeLabel}
      style={{fontSize: '8px'}}
    >
      12a
    </text>
  </g>
);

const GridLines = ({ config, weekDays }) => (
  <g className="grid-lines">
    {/* Vertical day and time lines */}
    {weekDays.map((_, dayIndex) => {
      const dayX = config.padding.left + dayIndex * config.dayWidth;
      return (
        <g key={dayIndex}>
          <line className="chart-grid-line-vertical" x1={dayX} y1={config.padding.top} x2={dayX} y2={config.height - config.padding.bottom} />
          {/* Time lines at 12am and 12pm within each day */}
          {[0, 12].map(hour => {
            const timeRatio = hour / 24;
            const x = config.padding.left + (dayIndex * config.dayWidth) + (timeRatio * config.dayWidth);
            return <line key={`${dayIndex}-${hour}`} className="chart-grid-line-vertical-time" x1={x} y1={config.padding.top} x2={x} y2={config.height - config.padding.bottom} />;
          })}
        </g>
      );
    })}
    {/* Final grid line at the end of the last day */}
    <line 
      className="chart-grid-line-vertical" 
      x1={config.padding.left + weekDays.length * config.dayWidth} 
      y1={config.padding.top} 
      x2={config.padding.left + weekDays.length * config.dayWidth} 
      y2={config.height - config.padding.bottom} 
    />
  </g>
);

const DataBars = ({ readings, type, config, onBarHover, onBarLeave }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  const valueRange = config.yAxisRange[type];
  const yOffset = config.yAxisOffset[type];
  const getColor = type === 'systolic' ? getSystolicColor : getDiastolicColor;

  return (
    <g className="data-bars">
      {readings.map((reading, index) => {
        const readingDate = new Date(reading.date);
        const dayIndex = readingDate.getDay();
        const x = getTimePosition(readingDate, dayIndex, config);
        const value = reading[type];
        const barHeight = (value / valueRange) * chartHeight;
        const y = config.height - config.padding.bottom - barHeight;

        const handleMouseEnter = (event) => {
          const tooltipData = {
            type: type === 'systolic' ? 'Systolic' : 'Diastolic',
            value: value,
            unit: 'mmHg',
            time: readingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            date: readingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
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
            height={Math.max(0, barHeight)}
            fill={getColor(value)}
            style={{ cursor: 'pointer' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </g>
  );
};

// New Combined I-Bar Chart Component
const CombinedDataBars = ({ readings, config, onBarHover, onBarLeave }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  const systolicRange = config.yAxisRange.systolic;
  const diastolicRange = config.yAxisRange.diastolic;
  const systolicOffset = config.yAxisOffset.systolic;
  const diastolicOffset = config.yAxisOffset.diastolic;

  return (
    <g className="combined-data-bars">
      {readings.map((reading, index) => {
        const readingDate = new Date(reading.date);
        const dayIndex = readingDate.getDay();
        const x = getTimePosition(readingDate, dayIndex, config);
        
        // Calculate positions for both systolic and diastolic
        const systolicValue = reading.systolic;
        const diastolicValue = reading.diastolic;
        
        const systolicBarHeight = (systolicValue / systolicRange) * chartHeight;
        const diastolicBarHeight = (diastolicValue / diastolicRange) * chartHeight;
        
        const systolicY = config.height - config.padding.bottom - systolicBarHeight;
        const diastolicY = config.height - config.padding.bottom - diastolicBarHeight;
        
        // Determine overall risk color based on both values
        const getCombinedRiskColor = (systolic, diastolic) => {
          if (systolic >= 140 || diastolic >= 90) return 'var(--chart-color-orange)'; // High
          if (systolic >= 120 || diastolic >= 80) return 'var(--chart-color-yellow)'; // Pre-high
          if (systolic < 90 || diastolic < 60) return 'var(--chart-color-danger)'; // Low
          return 'var(--chart-color-blue)'; // Ideal
        };
        
        const riskColor = getCombinedRiskColor(systolicValue, diastolicValue);

        const handleMouseEnter = (event) => {
          const tooltipData = {
            type: 'Blood Pressure',
            systolic: systolicValue,
            diastolic: diastolicValue,
            unit: 'mmHg',
            time: readingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            date: readingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            position: { x: event.clientX, y: event.clientY }
          };
          onBarHover(tooltipData);
        };

        const handleMouseLeave = () => {
          onBarLeave();
        };

        return (
          <g key={index} className="bp-reading-group">
            {/* I-Bar: Vertical line connecting systolic and diastolic */}
            <line
              x1={x}
              y1={systolicY}
              x2={x}
              y2={diastolicY}
              stroke={riskColor}
              strokeWidth="3"
              style={{ cursor: 'pointer' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            {/* Systolic point */}
            <circle
              cx={x}
              cy={systolicY}
              r="4"
              fill={riskColor}
              style={{ cursor: 'pointer' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            {/* Diastolic point */}
            <circle
              cx={x}
              cy={diastolicY}
              r="4"
              fill={riskColor}
              style={{ cursor: 'pointer' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </g>
        );
      })}
    </g>
  );
};

const Chart = ({ type, weekData, isExpanded, weekDays, containerWidth, onBarHover, onBarLeave }) => {
  // Simple inline config - no factory pattern needed
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
        yAxisRange: { systolic: 200, diastolic: 120 },
        yAxisOffset: { systolic: 0, diastolic: 0 },
        yAxisLabels: {
          systolic: [0, 40, 80, 120, 160, 200],
          diastolic: [0, 20, 40, 60, 80, 100, 120],
        },
        dayPadding: 10,
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
        yAxisRange: { systolic: 200, diastolic: 120 },
        yAxisOffset: { systolic: 0, diastolic: 0 },
        yAxisLabels: {
          systolic: [0, 100, 200],
          diastolic: [0, 60, 120],
        },
        dayPadding: 6,
      };
  
  const readings = weekData.filter(d => d[type] && d[type] > 0);

  return (
    <div className={`chart-section ${isExpanded ? 'expanded' : ''}`}>
      <h4 className="chart-subtitle">{type === 'systolic' ? 'Systolic' : 'Diastolic'}</h4>
      <div className="bp-svg-container">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="chart-svg"
        >
          <GridLines config={config} weekDays={weekDays} />
          <YAxis config={config} type={type} />
          <XAxis config={config} weekDays={weekDays} />
          <DataBars readings={readings} type={type} config={config} onBarHover={onBarHover} onBarLeave={onBarLeave} />
        </svg>
      </div>
    </div>
  );
};

// New Combined Chart Component
const CombinedChart = ({ weekData, isExpanded, weekDays, containerWidth, onBarHover, onBarLeave }) => {
  // Simple inline config - no factory pattern needed
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
        yAxisRange: { systolic: 200, diastolic: 120 },
        yAxisOffset: { systolic: 0, diastolic: 0 },
        yAxisLabels: {
          systolic: [0, 40, 80, 120, 160, 200],
          diastolic: [0, 20, 40, 60, 80, 100, 120],
        },
        dayPadding: 10,
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
        yAxisRange: { systolic: 200, diastolic: 120 },
        yAxisOffset: { systolic: 0, diastolic: 0 },
        yAxisLabels: {
          systolic: [0, 100, 200],
          diastolic: [0, 60, 120],
        },
        dayPadding: 6,
      };
  
  const readings = weekData.filter(d => d.systolic && d.diastolic && d.systolic > 0 && d.diastolic > 0);

  return (
    <div className={`chart-section combined-chart ${isExpanded ? 'expanded' : ''}`}>
      <h4 className="chart-subtitle">Blood Pressure (Systolic/Diastolic)</h4>
      <div className="bp-svg-container">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="chart-svg"
        >
          {/* Blood pressure range background */}
          <BPRangeBackground config={config} />
          <GridLines config={config} weekDays={weekDays} />
          {/* Dual Y-axis for both systolic and diastolic */}
          <DualYAxis config={config} />
          <XAxis config={config} weekDays={weekDays} />
          <CombinedDataBars readings={readings} config={config} onBarHover={onBarHover} onBarLeave={onBarLeave} />
        </svg>
      </div>
    </div>
  );
};

const getSystolicColor = (value) => {
  if (value < 90) return 'var(--chart-color-danger)';
  if (value < 120) return 'var(--chart-color-blue)';
  if (value < 140) return 'var(--chart-color-yellow)';
  return 'var(--chart-color-orange)';
};

const getDiastolicColor = (value) => {
  if (value < 60) return 'var(--chart-color-danger)';
  if (value < 80) return 'var(--chart-color-blue)';
  if (value < 90) return 'var(--chart-color-yellow)';
  return 'var(--chart-color-orange)';
};

const bloodPressureLegendItems = [
  { color: 'var(--chart-color-danger)', label: 'Low', description: 'Blood pressure below normal range' },
  { color: 'var(--chart-color-blue)', label: 'Ideal', description: 'Blood pressure within ideal range' },
  { color: 'var(--chart-color-yellow)', label: 'Pre-high', description: 'Blood pressure elevated but not yet high' },
  { color: 'var(--chart-color-orange)', label: 'High', description: 'Blood pressure high - requires attention' },
];



// --- Main Component ---
const BloodPressureChart = ({ patientId, isExpanded = false, onExpand, viewMode = 'patient', navigation, screenshotMode = false, showThreeMonthSummaries = false }) => {
  const { bloodPressureData, loading, error } = usePatientData(patientId, 'bloodPressure');
  const [containerWidth, setContainerWidth] = useState(400);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [useCombinedView, setUseCombinedView] = useState(true); // New state for view toggle
  const containerRef = useRef(null);

  // Use navigation from parent or fallback to internal navigation
  const useInternalNavigation = !navigation;
  const internalNavigation = useChartNavigation('bloodPressure');
  const nav = navigation || internalNavigation;



  // Resize observer to track container width changes
  useLayoutEffect(() => {
    const observeContainer = () => {
      if (containerRef.current) {
        const resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
            const { width } = entry.contentRect;
            setContainerWidth(width);
          }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
      }
    };

    const cleanup = observeContainer();
    return cleanup;
  }, []);

  const { start: weekStart, end: weekEnd } = nav.getDateRange();

  const weekData = bloodPressureData.filter(d => {
    const readingDate = new Date(d.date);
    return readingDate >= weekStart && readingDate <= weekEnd;
  });

  // Get 3-month data
  const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
  const threeMonthData = bloodPressureData.filter(d => {
    const readingDate = new Date(d.date);
    return readingDate >= startOfThreeMonths && readingDate <= endOfThreeMonths;
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });



  const formatDateRange = (start, end) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} to ${endStr}`;
  };

  const handleBarHover = (data) => {
    setTooltipData(data);
    setTooltipPosition(data.position);
  };

  const handleBarLeave = () => {
    setTooltipData(null);
  };

  // Calculate summary statistics for physician view
  let weekSummary = null;
  if (weekData.length > 0) {
    const systolicReadings = weekData.filter(d => d.systolic && d.systolic > 0).map(d => d.systolic);
    const diastolicReadings = weekData.filter(d => d.diastolic && d.diastolic > 0).map(d => d.diastolic);

    const avgSystolic = systolicReadings.length > 0 ? 
      (systolicReadings.reduce((sum, val) => sum + val, 0) / systolicReadings.length).toFixed(0) : 0;
    const avgDiastolic = diastolicReadings.length > 0 ? 
      (diastolicReadings.reduce((sum, val) => sum + val, 0) / diastolicReadings.length).toFixed(0) : 0;

    const maxSystolic = systolicReadings.length > 0 ? Math.max(...systolicReadings) : 0;
    const maxDiastolic = diastolicReadings.length > 0 ? Math.max(...diastolicReadings) : 0;

    const getRiskCategory = (systolic, diastolic) => {
      if (systolic >= 135 || diastolic >= 85) return 'High Risk';
      if (systolic >= 121 || diastolic >= 80) return 'Medium Risk';
      return 'Low Risk';
    };

    const avgRisk = getRiskCategory(parseFloat(avgSystolic), parseFloat(avgDiastolic));
    const daysWithReadings = new Set(weekData.map(d => d.date.toDateString())).size;

    weekSummary = {
      avgSystolic,
      avgDiastolic,
      maxSystolic,
      maxDiastolic,
      avgRisk,
      daysWithReadings,
      totalReadings: weekData.length
    };
  }

  // Calculate 3-month summary statistics for physician view
  let threeMonthSummary = null;
  if (threeMonthData.length > 0) {

    const systolicReadings = threeMonthData.filter(d => d.systolic && d.systolic > 0).map(d => d.systolic);
    const diastolicReadings = threeMonthData.filter(d => d.diastolic && d.diastolic > 0).map(d => d.diastolic);

    const avgSystolic = systolicReadings.length > 0 ? 
      (systolicReadings.reduce((sum, val) => sum + val, 0) / systolicReadings.length).toFixed(0) : 0;
    const avgDiastolic = diastolicReadings.length > 0 ? 
      (diastolicReadings.reduce((sum, val) => sum + val, 0) / diastolicReadings.length).toFixed(0) : 0;

    const maxSystolic = systolicReadings.length > 0 ? Math.max(...systolicReadings) : 0;
    const maxDiastolic = diastolicReadings.length > 0 ? Math.max(...diastolicReadings) : 0;

    const getRiskCategory = (systolic, diastolic) => {
      if (systolic >= 135 || diastolic >= 85) return 'High Risk';
      if (systolic >= 121 || diastolic >= 80) return 'Medium Risk';
      return 'Low Risk';
    };

    const avgRisk = getRiskCategory(parseFloat(avgSystolic), parseFloat(avgDiastolic));
    const daysWithReadings = new Set(threeMonthData.map(d => d.date.toDateString())).size;

    threeMonthSummary = {
      avgSystolic,
      avgDiastolic,
      maxSystolic,
      maxDiastolic,
      avgRisk,
      daysWithReadings,
      totalReadings: threeMonthData.length
    };
  }

  return (
    <>
      <div className={`bp-chart-container ${isExpanded ? 'expanded' : ''}`} ref={containerRef}>
        <div className="bp-header">
          <h3 className="bp-main-title">Blood Pressure</h3>
          <h4 className="chart-subtitle">{nav.getFormattedDateRange()}</h4>
          
          {/* View Toggle */}
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${!useCombinedView ? 'active' : ''}`}
              onClick={() => setUseCombinedView(false)}
            >
              Separate Charts
            </button>
            <button 
              className={`toggle-btn ${useCombinedView ? 'active' : ''}`}
              onClick={() => setUseCombinedView(true)}
            >
              Combined View
            </button>
          </div>
        </div>
        
        <div className="bp-charts-wrapper">
          {useCombinedView ? (
            <CombinedChart 
              weekData={weekData} 
              isExpanded={isExpanded} 
              weekDays={weekDays} 
              containerWidth={containerWidth}
              onBarHover={handleBarHover}
              onBarLeave={handleBarLeave}
            />
          ) : (
            <>
              <Chart 
                type="systolic" 
                weekData={weekData} 
                isExpanded={isExpanded} 
                weekDays={weekDays} 
                containerWidth={containerWidth}
                onBarHover={handleBarHover}
                onBarLeave={handleBarLeave}
              />
              <Chart 
                type="diastolic" 
                weekData={weekData} 
                isExpanded={isExpanded} 
                weekDays={weekDays} 
                containerWidth={containerWidth}
                onBarHover={handleBarHover}
                onBarLeave={handleBarLeave}
              />
            </>
          )}
        </div>
        
        <Legend title="Blood Pressure Category:" items={bloodPressureLegendItems} hide={screenshotMode} />
        
        {/* Show InfoBox for patient view, summary for physician/unified view */}
        {(viewMode === 'physician' || viewMode === 'unified') && weekSummary ? (
          <>
            <InfoBox 
              title="Blood Pressure Information" 
              content="Blood pressure is measured by two numbers: systolic and diastolic. Low blood pressure is a systolic reading below 90 mmHg and a diastolic reading below 60 mmHg. Ideal blood pressure is a systolic reading between 90 and 120 mmHg and a diastolic reading between 60 and 80 mmHg. Pre-high blood pressure is a systolic reading between 120 and 140 mmHg or a diastolic reading between 80 and 90 mmHg. High blood pressure is a systolic reading of 140 mmHg or higher or a diastolic reading of 90 mmHg or higher (Blood Pressure UK)."
            />
            <div className="summary-container">
              <div className="chart-summary">
                <h4>Week Summary</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Average BP:</span>
                    <span className="stat-value">
                      {weekSummary.avgSystolic}/{weekSummary.avgDiastolic} mmHg
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Peak BP:</span>
                    <span className="stat-value">
                      {weekSummary.maxSystolic}/{weekSummary.maxDiastolic} mmHg
                    </span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Reading Days:</span>
                    <span className="stat-value">
                      {weekSummary.daysWithReadings}/7 days
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Readings:</span>
                    <span className="stat-value">
                      {weekSummary.totalReadings}
                    </span>
                  </div>
                </div>
              </div>
              
              {showThreeMonthSummaries && threeMonthSummary && (
                <div className="chart-summary">
                  <h4>3-Month Summary</h4>
                  <div className="summary-stats">
                    <div className="stat-item">
                      <span className="stat-label">Average BP:</span>
                      <span className="stat-value">
                        {threeMonthSummary.avgSystolic}/{threeMonthSummary.avgDiastolic} mmHg
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Peak BP:</span>
                      <span className="stat-value">
                        {threeMonthSummary.maxSystolic}/{threeMonthSummary.maxDiastolic} mmHg
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Readings:</span>
                      <span className="stat-value">
                        {threeMonthSummary.totalReadings}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <InfoBox 
            title="Blood Pressure Information" 
            content="Blood pressure is measured by two numbers: systolic and diastolic. Low blood pressure is a systolic reading below 90 mmHg and a diastolic reading below 60 mmHg. Ideal blood pressure is a systolic reading between 90 and 120 mmHg and a diastolic reading between 60 and 80 mmHg. Pre-high blood pressure is a systolic reading between 120 and 140 mmHg or a diastolic reading between 80 and 90 mmHg. High blood pressure is a systolic reading of 140 mmHg or higher or a diastolic reading of 90 mmHg or higher (Blood Pressure UK)."
          />
        )}
      </div>
      
      {/* Custom Tooltip */}
      <Tooltip
        isVisible={!!tooltipData}
        content={tooltipData && (
          <div>
            <div className="tooltip-title">{tooltipData.type} Blood Pressure</div>
            {tooltipData.systolic && tooltipData.diastolic ? (
              <div className="tooltip-value">
                {tooltipData.systolic}/{tooltipData.diastolic} {tooltipData.unit}
              </div>
            ) : (
              <div className="tooltip-value">{tooltipData.value} {tooltipData.unit}</div>
            )}
            <div className="tooltip-time">{tooltipData.time}</div>
            <div className="tooltip-date">{tooltipData.date}</div>
          </div>
        )}
        position={tooltipPosition}
      />
    </>
  );
};

export default BloodPressureChart;
