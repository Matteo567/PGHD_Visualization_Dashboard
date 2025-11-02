/*
 BloodPressureChart.js - Blood Pressure Monitoring Visualization
 
 This component provides blood pressure tracking with systolic and diastolic pressure visualization. It includes risk categorization with color coding and provides daily and weekly trend analysis. It supports display of multiple daily measurements and includes interactive tooltips with blood pressure details. It includes navigation controls for time periods. The component uses custom SVG for blood pressure visualization and implements a dual-axis system for systolic and diastolic values. It provides risk-based color coding for clinical interpretation and supports multiple daily readings with time-based positioning. The component implements configurable layouts. Visualization features include color-coded risk categories including normal, elevated, high, and crisis, time-based positioning for multiple daily readings, interactive tooltips with detailed blood pressure information, and a grid system with axis scaling. Clinical features include risk categorization based on medical guidelines, summary statistics for physician view, trend analysis over time periods, and educational information for patient view. The component structure includes a dual-axis system for systolic and diastolic values on the Y-axis, a time-based axis with day and time labels on the X-axis, interactive blood pressure readings as data points, risk category explanations in the legend, and detailed reading information in tooltips. This component is used for cardiovascular health monitoring and hypertension management.
 */

import React, { useState, useRef } from 'react';
import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';
import Legend from '../Legend';
import InfoBox from '../InfoBox';
import Tooltip from '../ui/Tooltip';
import './BloodPressureChart.css';

// Constants
// Helper Functions

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
const BPRangeBackground = ({ config, isCombined = false }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  
  if (isCombined) {
    // For combined chart with single axis (0-200), show only ideal ranges as green bars
    // This avoids conflicts with dot colors which use combined risk assessment
    const valueRange = config.yAxisRange;
    const yOffset = config.yAxisOffset;
    
    // Ideal ranges: Systolic 90-120, Diastolic 60-80
    const idealRanges = [
      { 
        name: 'Systolic Ideal', 
        min: 90, 
        max: 120, 
        color: 'var(--chart-color-bp-ideal)', 
        opacity: 0.15 
      },
      { 
        name: 'Diastolic Ideal', 
        min: 60, 
        max: 80, 
        color: 'var(--chart-color-bp-ideal)', 
        opacity: 0.15 
      }
    ];

    return (
      <g className="bp-range-background">
        {idealRanges.map((range) => {
          const topY = config.height - config.padding.bottom - 
            ((range.max - yOffset) / valueRange) * chartHeight;
          const bottomY = config.height - config.padding.bottom - 
            ((range.min - yOffset) / valueRange) * chartHeight;

          return (
            <rect
              key={range.name}
              x={config.padding.left}
              y={Math.min(topY, bottomY)}
              width={config.width - config.padding.left - config.padding.right}
              height={Math.abs(bottomY - topY)}
              fill={range.color}
              opacity={range.opacity}
              className="bp-range-ideal"
            />
          );
        })}
      </g>
    );
  } else {
    // For separate charts, use dual-axis ranges
    const systolicRange = config.yAxisRange.systolic;
    const diastolicRange = config.yAxisRange.diastolic;
    const systolicOffset = config.yAxisOffset.systolic;
    const diastolicOffset = config.yAxisOffset.diastolic;

    const ranges = [
      { 
        name: 'High', 
        systolic: [140, 200], 
        diastolic: [90, 120], 
        color: 'var(--chart-color-bp-high)', 
        opacity: 0.1 
      },
      { 
        name: 'Pre-high', 
        systolic: [120, 140], 
        diastolic: [80, 90], 
        color: 'var(--chart-color-bp-pre-high)', 
        opacity: 0.1 
      },
      { 
        name: 'Ideal', 
        systolic: [90, 120], 
        diastolic: [60, 80], 
        color: 'var(--chart-color-bp-ideal)', 
        opacity: 0.1 
      },
      { 
        name: 'Low', 
        systolic: [0, 90], 
        diastolic: [0, 60], 
        color: 'var(--chart-color-bp-low)', 
        opacity: 0.1 
      }
    ];

    return (
      <g className="bp-range-background">
        {ranges.map((range) => {
          const systolicTopY = config.height - config.padding.bottom - 
            ((range.systolic[1] - systolicOffset) / systolicRange) * chartHeight;
          const systolicBottomY = config.height - config.padding.bottom - 
            ((range.systolic[0] - systolicOffset) / systolicRange) * chartHeight;
          
          const diastolicTopY = config.height - config.padding.bottom - 
            ((range.diastolic[1] - diastolicOffset) / diastolicRange) * chartHeight;
          const diastolicBottomY = config.height - config.padding.bottom - 
            ((range.diastolic[0] - diastolicOffset) / diastolicRange) * chartHeight;

          return (
            <g key={range.name}>
              <rect
                x={config.padding.left}
                y={Math.min(systolicTopY, systolicBottomY)}
                width={config.width - config.padding.left - config.padding.right}
                height={Math.abs(systolicBottomY - systolicTopY)}
                fill={range.color}
                opacity={range.opacity}
                className={`bp-range-${range.name.toLowerCase()}`}
              />
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
  }
};

// Dual Y-Axis Component for Combined Chart
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
            style={{fontSize: '13px'}}
          >
            12a
          </text>
          <text
            className="time-label"
            x={middleTickX}
            y={config.height - config.padding.bottom + 15}
            textAnchor="middle"
            fontSize={config.fontSize.timeLabel}
            style={{fontSize: '13px'}}
          >
            12p
          </text>

          {/* Day and Date Labels */}
          <text
            x={dayCenterX}
            y={config.height - config.padding.bottom + 40}
            textAnchor="middle"
            className="x-axis-day-label"
            fontSize={config.fontSize.dayLabel}
            style={{fontSize: '13px'}}
          >
            {formatDayLabel(day)}
          </text>
          <text
            x={dayCenterX}
            y={config.height - config.padding.bottom + 62}
            textAnchor="middle"
            className="x-axis-date-label"
            fontSize={config.fontSize.dateLabel}
            style={{fontSize: '13px'}}
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
      style={{fontSize: '13px'}}
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

const getSystolicColor = (value) => {
  if (value < 90) return 'var(--chart-color-bp-low)';
  if (value < 120) return 'var(--chart-color-bp-ideal)';
  if (value < 140) return 'var(--chart-color-bp-pre-high)';
  return 'var(--chart-color-bp-high)';
};

const getDiastolicColor = (value) => {
  if (value < 60) return 'var(--chart-color-bp-low)';
  if (value < 80) return 'var(--chart-color-bp-ideal)';
  if (value < 90) return 'var(--chart-color-bp-pre-high)';
  return 'var(--chart-color-bp-high)';
};

// Combined I-Bar Chart Component
const CombinedDataBars = ({ readings, config, onBarHover, onBarLeave }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  // Use single range for both systolic and diastolic (0-200 covers both)
  const valueRange = config.yAxisRange;
  const yOffset = config.yAxisOffset;

  // Determine overall risk color and category based on both values
  // Based on Blood_pressure_range_description.txt:
  // Low: systolic < 90 AND diastolic < 60
  // Ideal: systolic 90-120 AND diastolic 60-80
  // Pre-high: systolic 120-140 OR diastolic 80-90
  // High: systolic >= 140 OR diastolic >= 90
  // This simplified function combines both color and category into one return value
  function getCombinedRisk(systolic, diastolic) {
    // High: systolic >= 140 OR diastolic >= 90
    if (systolic >= 140 || diastolic >= 90) {
      return {
        name: 'High',
        color: 'var(--chart-color-bp-high)'
      };
    }
    
    // Pre-high: systolic 120-140 OR diastolic 80-90 (but not already high)
    if ((systolic >= 120 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
      return {
        name: 'Pre-High',
        color: 'var(--chart-color-bp-pre-high)'
      };
    }
    
    // Low: systolic < 90 AND diastolic < 60 (both must be low)
    if (systolic < 90 && diastolic < 60) {
      return {
        name: 'Low',
        color: 'var(--chart-color-bp-low)'
      };
    }
    
    // Ideal: systolic 90-120 AND diastolic 60-80 (default for remaining cases)
    return {
      name: 'Ideal',
      color: 'var(--chart-color-bp-ideal)'
    };
  }

  // Sort readings by date/time for proper line connection
  const sortedReadings = [...readings].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // Build path string for trend lines - simpler version using basic loops
  function buildPath(points) {
    if (points.length === 0) {
      return '';
    }
    
    let pathString = '';
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        // First point: use 'M' (move to)
        pathString = pathString + 'M ' + points[i].x + ' ' + points[i].y;
      } else {
        // Other points: use 'L' (line to)
        pathString = pathString + ' L ' + points[i].x + ' ' + points[i].y;
      }
    }
    
    return pathString;
  }

  // Calculate all point positions
  const points = sortedReadings.map((reading) => {
    const readingDate = new Date(reading.date);
    const dayIndex = readingDate.getDay();
    const x = getTimePosition(readingDate, dayIndex, config);
    
    const systolicValue = reading.systolic;
    const diastolicValue = reading.diastolic;
    
    const systolicBarHeight = ((systolicValue - yOffset) / valueRange) * chartHeight;
    const diastolicBarHeight = ((diastolicValue - yOffset) / valueRange) * chartHeight;
    
    const systolicY = config.height - config.padding.bottom - systolicBarHeight;
    const diastolicY = config.height - config.padding.bottom - diastolicBarHeight;
    
    return {
      x,
      systolicY,
      diastolicY,
      reading,
      readingDate,
      systolicValue,
      diastolicValue
    };
  });

  // Build paths for both lines
  const systolicPath = buildPath(points.map(p => ({ x: p.x, y: p.systolicY })));
  const diastolicPath = buildPath(points.map(p => ({ x: p.x, y: p.diastolicY })));

  return (
    <g className="combined-data-bars">
      {/* Trend lines - draw before dots so dots appear on top */}
      {systolicPath && points.length > 1 && (
        <path
          d={systolicPath}
          fill="none"
          stroke="#cccccc"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="systolic-trend-line"
        />
      )}
      {diastolicPath && points.length > 1 && (
        <path
          d={diastolicPath}
          fill="none"
          stroke="#cccccc"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="diastolic-trend-line"
        />
      )}
      
      {/* Individual data points */}
      {points.map((point, index) => {
        const { reading, readingDate, x, systolicY, diastolicY, systolicValue, diastolicValue } = point;
        
        const risk = getCombinedRisk(systolicValue, diastolicValue);
        const combinedRiskColor = risk.color;
        const riskCategory = risk;

        const handleMouseEnter = (event) => {
          const tooltipData = {
            type: 'Blood Pressure',
            systolic: systolicValue,
            diastolic: diastolicValue,
            unit: 'mmHg',
            category: riskCategory.name,
            categoryColor: riskCategory.color,
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
            {/* Systolic point - standardized styling */}
            <circle
              cx={x}
              cy={systolicY}
              r="5"
              fill={combinedRiskColor}
              stroke="#cccccc"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              className="systolic-dot"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            {/* Diastolic point - standardized styling */}
            <circle
              cx={x}
              cy={diastolicY}
              r="5"
              fill={combinedRiskColor}
              stroke="#cccccc"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              className="diastolic-dot"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </g>
        );
      })}
    </g>
  );
};

const Chart = ({ type, weekData, isExpanded, weekDays, onBarHover, onBarLeave }) => {
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
          timeLabel: 22,
          dayLabel: 22,
          dateLabel: 22,
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
          timeLabel: 19,
          dayLabel: 19,
          dateLabel: 19,
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

// Combined Y-Axis Component for Combined Chart (single axis)
const CombinedYAxis = ({ config }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  const yAxisLabels = config.yAxisLabels;
  const valueRange = config.yAxisRange;
  const yOffset = config.yAxisOffset;

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
        Millimeters of mercury (mmHg)
      </text>
      {yAxisLabels.map(value => {
        const y = config.height - config.padding.bottom - ((value - yOffset) / valueRange) * chartHeight;
        return (
          <g key={value} className="y-axis-grid-group">
            <line className="chart-grid-line-horizontal" x1={config.padding.left} y1={y} x2={config.width - config.padding.right} y2={y} />
            <text 
              x={config.padding.left - 10} 
              y={y + 3} 
              fontSize={config.fontSize.yAxis} 
              textAnchor="end" 
              className="chart-tick-label"
            >
              {value}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// Combined Chart Component
const CombinedChart = ({ weekData, isExpanded, weekDays, onBarHover, onBarLeave }) => {
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
          timeLabel: 22,
          dayLabel: 22,
          dateLabel: 22,
        },
        barWidth: 12,
        yAxisRange: 200,  // Single range for both systolic and diastolic
        yAxisOffset: 0,
        yAxisLabels: [0, 40, 80, 120, 160, 200],
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
          timeLabel: 19,
          dayLabel: 19,
          dateLabel: 19,
        },
        barWidth: 8,
        yAxisRange: 200,  // Single range for both systolic and diastolic
        yAxisOffset: 0,
        yAxisLabels: [0, 50, 100, 150, 200],
        dayPadding: 6,
      };
  
  // Filter readings and validate that systolic > diastolic (medically required)
  const readings = weekData.filter(d => 
    d.systolic && d.diastolic && 
    d.systolic > 0 && d.diastolic > 0 &&
    d.systolic > d.diastolic  // Ensure systolic is always greater than diastolic
  );

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
          <BPRangeBackground config={config} isCombined={true} />
          <GridLines config={config} weekDays={weekDays} />
          {/* Single Y-axis for combined chart */}
          <CombinedYAxis config={config} />
          <XAxis config={config} weekDays={weekDays} />
          <CombinedDataBars readings={readings} config={config} onBarHover={onBarHover} onBarLeave={onBarLeave} />
        </svg>
      </div>
    </div>
  );
};

const bloodPressureLegendItems = [
  { color: 'var(--chart-color-bp-low)', label: 'Low', description: 'Blood pressure below normal range' },
  { color: 'var(--chart-color-bp-ideal)', label: 'Ideal', description: 'Blood pressure within ideal range' },
  { color: 'var(--chart-color-bp-pre-high)', label: 'Pre-high', description: 'Blood pressure elevated but not yet high' },
  { color: 'var(--chart-color-bp-high)', label: 'High', description: 'Blood pressure high - requires attention' },
];



// --- Main Component ---
const BloodPressureChart = ({ patientId, isExpanded = false, onExpand, accessType = 'Admin', navigation, screenshotMode = false, showThreeMonthSummaries = false }) => {
  const { bloodPressureData, loading, error } = usePatientData(patientId);
  const [tooltipData, setTooltipData] = useState(null);
  // For Patient access, force Combined View (remove Separate Charts access).
  // For Physician access, force Combined View (remove Separate Charts access).
  // Admin can toggle between both.
  const shouldForceCombinedView = accessType === 'Patient' || accessType === 'Physician';
  
  // Determine initial view state
  let initialUseCombinedView = false;
  if (shouldForceCombinedView) {
    initialUseCombinedView = true;
  }
  
  const [useCombinedView, setUseCombinedView] = useState(initialUseCombinedView); // State for view toggle
  
  // Enforce combined view for Patient and Physician - override state if needed
  const effectiveUseCombinedView = shouldForceCombinedView ? true : useCombinedView;
  const containerRef = useRef(null);

  // Use navigation from parent or fallback to internal navigation
  const internalNavigation = useChartNavigation('bloodPressure');
  const nav = navigation || internalNavigation;

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




  const handleBarHover = (data) => {
    setTooltipData(data);
  };

  const handleBarLeave = () => {
    setTooltipData(null);
  };

  // Helper function to calculate blood pressure summary statistics
  // This function calculates average, max, risk categories, and reading counts for any data period
  function calculateBPSummary(data) {
    if (!data || data.length === 0) {
      return null;
    }

    // Get all valid readings (where both systolic and diastolic are > 0)
    const systolicReadings = [];
    const diastolicReadings = [];
    
    for (let i = 0; i < data.length; i++) {
      if (data[i].systolic && data[i].systolic > 0) {
        systolicReadings.push(data[i].systolic);
      }
      if (data[i].diastolic && data[i].diastolic > 0) {
        diastolicReadings.push(data[i].diastolic);
      }
    }

    // Calculate averages
    let systolicSum = 0;
    for (let i = 0; i < systolicReadings.length; i++) {
      systolicSum = systolicSum + systolicReadings[i];
    }
    const avgSystolic = systolicReadings.length > 0 ? 
      (systolicSum / systolicReadings.length).toFixed(0) : 0;
    
    let diastolicSum = 0;
    for (let i = 0; i < diastolicReadings.length; i++) {
      diastolicSum = diastolicSum + diastolicReadings[i];
    }
    const avgDiastolic = diastolicReadings.length > 0 ? 
      (diastolicSum / diastolicReadings.length).toFixed(0) : 0;

    // Find maximum values
    let maxSystolic = 0;
    for (let i = 0; i < systolicReadings.length; i++) {
      if (systolicReadings[i] > maxSystolic) {
        maxSystolic = systolicReadings[i];
      }
    }
    
    let maxDiastolic = 0;
    for (let i = 0; i < diastolicReadings.length; i++) {
      if (diastolicReadings[i] > maxDiastolic) {
        maxDiastolic = diastolicReadings[i];
      }
    }

    // Determine risk category based on average values
    const systolic = parseFloat(avgSystolic);
    const diastolic = parseFloat(avgDiastolic);
    let avgRisk;
    
    if (systolic >= 135 || diastolic >= 85) {
      avgRisk = 'High Risk';
    } else if (systolic >= 121 || diastolic >= 80) {
      avgRisk = 'Medium Risk';
    } else {
      avgRisk = 'Low Risk';
    }
    
    // Count unique days with readings
    const daysSet = new Set();
    for (let i = 0; i < data.length; i++) {
      const dateString = data[i].date.toDateString();
      daysSet.add(dateString);
    }
    const daysWithReadings = daysSet.size;

    // Count readings in ideal category (systolic 90-120 AND diastolic 60-80)
    let idealReadingsCount = 0;
    for (let i = 0; i < data.length; i++) {
      const systolic = data[i].systolic;
      const diastolic = data[i].diastolic;
      if (systolic && systolic >= 90 && systolic < 120 &&
          diastolic && diastolic >= 60 && diastolic < 80) {
        idealReadingsCount++;
      }
    }

    return {
      avgSystolic,
      avgDiastolic,
      maxSystolic,
      maxDiastolic,
      avgRisk,
      daysWithReadings,
      totalReadings: data.length,
      idealReadingsCount
    };
  }

  // Calculate summary statistics for week period
  const weekSummary = calculateBPSummary(weekData);

  // Calculate 3-month summary using the same helper function
  const threeMonthSummary = calculateBPSummary(threeMonthData);

  return (
    <>
      <div className={`bp-chart-container ${isExpanded ? 'expanded' : ''}`} ref={containerRef}>
        <div className="bp-header">
          <h3 className="bp-main-title">Blood Pressure</h3>
          <h4 className="chart-subtitle">{nav.getFormattedDateRange()}</h4>
          
          {/* View Toggle - Hide for Patient and Physician, show both for Admin */}
          {accessType === 'Admin' && (
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${!effectiveUseCombinedView ? 'active' : ''}`}
                onClick={() => setUseCombinedView(false)}
              >
                Separate Charts
              </button>
              <button 
                className={`toggle-btn ${effectiveUseCombinedView ? 'active' : ''}`}
                onClick={() => setUseCombinedView(true)}
              >
                Combined View
              </button>
            </div>
          )}
        </div>
        
        <div className="bp-charts-wrapper">
          {effectiveUseCombinedView ? (
            <CombinedChart 
              weekData={weekData} 
              isExpanded={isExpanded} 
              weekDays={weekDays} 
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
                onBarHover={handleBarHover}
                onBarLeave={handleBarLeave}
              />
              <Chart 
                type="diastolic" 
                weekData={weekData} 
                isExpanded={isExpanded} 
                weekDays={weekDays} 
                onBarHover={handleBarHover}
                onBarLeave={handleBarLeave}
              />
            </>
          )}
        </div>
        
        <Legend title="Blood Pressure Category:" items={bloodPressureLegendItems} hide={screenshotMode} />
        
        {/* Show InfoBox for patient view, summary for physician/unified view - Hide InfoBox for Physician but keep summaries */}
        {weekSummary ? (
          <>
            {/* Hide InfoBox for Physician */}
            {accessType !== 'Physician' && (
              <InfoBox 
                title="Blood Pressure Information" 
                content="Blood pressure readings include a measurement of both systolic and diastolic blood pressure measured in millimeters of mercury (mmHg). Ideal blood pressure is a systolic reading between 90 and 120 mmHg and a diastolic reading between 60 and 80. High blood pressure is a systolic reading of 140 mmHg or higher or a diastolic reading of 90 mmHg or higher. Pre-high blood pressure is a systolic reading between 120 and 140 mmHg or a diastolic reading between 80 and 90 mmHg. Low blood pressure is a systolic reading below 90 mmHg and a diastolic reading below 60 mmHg (Blood Pressure UK)."
              />
            )}
            {/* Always show summaries for physician/unified view */}
            <div className="summary-container">
              <div className="chart-summary">
                <h4>Week Summary</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Average Blood Pressure:</span>
                    <span className="stat-value">
                      {weekSummary.avgSystolic}/{weekSummary.avgDiastolic} mmHg
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Peak Blood Pressure:</span>
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
                    <span className="stat-label">Total Readings in Ideal Category:</span>
                    <span className="stat-value">
                      {weekSummary.idealReadingsCount}
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
                      <span className="stat-label">Average Blood Pressure:</span>
                      <span className="stat-value">
                        {threeMonthSummary.avgSystolic}/{threeMonthSummary.avgDiastolic} mmHg
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Peak Blood Pressure:</span>
                      <span className="stat-value">
                        {threeMonthSummary.maxSystolic}/{threeMonthSummary.maxDiastolic} mmHg
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Reading Days:</span>
                      <span className="stat-value">
                        {threeMonthSummary.daysWithReadings} days
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Readings in Ideal Category:</span>
                      <span className="stat-value">
                        {threeMonthSummary.idealReadingsCount}
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
          accessType !== 'Physician' && (
            <InfoBox 
              title="Blood Pressure Information" 
              content="Blood pressure is measured by two numbers: systolic and diastolic. Low blood pressure is a systolic reading below 90 mmHg and a diastolic reading below 60 mmHg. Ideal blood pressure is a systolic reading between 90 and 120 mmHg and a diastolic reading between 60 and 80 mmHg. Pre-high blood pressure is a systolic reading between 120 and 140 mmHg or a diastolic reading between 80 and 90 mmHg. High blood pressure is a systolic reading of 140 mmHg or higher or a diastolic reading of 90 mmHg or higher (Blood Pressure UK)."
            />
          )
        )}
      </div>
      
      {/* Custom Tooltip */}
      <Tooltip
        isVisible={!!tooltipData}
        content={tooltipData && (
          <div>
            <div className="tooltip-title">{tooltipData.type === 'Blood Pressure' ? 'Blood Pressure' : `${tooltipData.type} Blood Pressure`}</div>
            {tooltipData.systolic && tooltipData.diastolic ? (
              <div className="tooltip-value">
                {tooltipData.systolic}/{tooltipData.diastolic} {tooltipData.unit}
              </div>
            ) : (
              <div className="tooltip-value">{tooltipData.value} {tooltipData.unit}</div>
            )}
            {tooltipData.category && (
              <div className="tooltip-category" style={{ color: tooltipData.categoryColor }}>
                {tooltipData.category}
              </div>
            )}
            <div className="tooltip-time">{tooltipData.time}</div>
            <div className="tooltip-date">{tooltipData.date}</div>
          </div>
        )}
        position={tooltipData ? tooltipData.position : { x: 0, y: 0 }}
      />
    </>
  );
};

export default BloodPressureChart;
