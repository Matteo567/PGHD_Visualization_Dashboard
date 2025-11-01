/*
 MealContentsChart.js - Nutritional Tracking Visualization
 
 This component provides meal and nutrition monitoring with meal timing and content breakdown. It tracks nutritional components and provides daily and weekly dietary pattern analysis. It includes interactive tooltips with meal details and navigation controls for time periods. It integrates with patient data and chart navigation. This component is used for dietary monitoring and nutritional assessment.
 */

import React, { useState, useEffect, useRef } from 'react';
import Legend from '../Legend';
import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';

import './MealContentsChart.css';


// --- Constants ---
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Late Night Snack'];
const FOOD_CATEGORIES = ['Protein', 'Carbohydrates', 'Vegetables', 'Fruit', 'Alcohol'];
const SUGAR_CATEGORIES = ['', '1-20g', '20-40g', '40-60g', '60g+'];
// Emoji mappings for food categories
const CATEGORY_EMOJIS = {
  'Protein': '🥩',
  'Carbohydrates': '🍞',
  'Vegetables': '🥦',
  'Fruit': '🍎',
  'Alcohol': '🍷'
};

const SUGAR_EMOJIS = {
  '': '',              // No sugar
  '1-20g': '🍭',       // Lollipop
  '20-40g': '🍫',      // Chocolate bar
  '40-60g': '🍩',      // Donut
  '60g+': '🎂'         // Cake
};



// --- Helper Functions ---
const formatDayLabel = (date) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[date.getDay()];
};

const getMealTime = (data, mealType) => {
  // Convert meal type to the correct column name format (with underscores)
  const columnPrefix = mealType.replace(/\s+/g, '_');
  const timeKey = `${columnPrefix}_Time`;
  return data[timeKey] || '';
};

const getMealData = (data, mealType) => {
  const mealData = {};
  
  // Convert meal type to the correct column name format (with underscores)
  const columnPrefix = mealType.replace(/\s+/g, '_');
  
  FOOD_CATEGORIES.forEach(category => {
    const key = `${columnPrefix}_${category}`;
    // Handle both numeric (1, 0) and string ('1', '0') values
    mealData[category] = data[key] === 1 || data[key] === '1';
  });
  
  const sugarKey = `${columnPrefix}_Added_Sugar`;
  mealData['Added Sugar'] = data[sugarKey] || '';
  
  return mealData;
};

// --- Chart Sub-components ---

const XAxis = ({ config, weekDays }) => (
  <g className="x-axis">
    {weekDays.map((day, dayIndex) => {
      const x = config.padding.left + dayIndex * config.dayWidth + config.dayWidth / 2;
      return (
        <g key={dayIndex}>
          <text
            x={x}
            y={config.height - config.padding.bottom + 30}
            fontSize={config.fontSize.dayLabel}
            textAnchor="middle"
            className="x-axis-day-label"
          >
            {formatDayLabel(day)}
          </text>
          <text
            x={x}
            y={config.height - config.padding.bottom + 45}
            fontSize={config.fontSize.dateLabel}
            textAnchor="middle"
            className="x-axis-date-label"
          >
            {day.getDate()}
          </text>
          <line
            className="chart-grid-line-vertical"
            x1={config.padding.left + dayIndex * config.dayWidth}
            y1={config.padding.top}
            x2={config.padding.left + dayIndex * config.dayWidth}
            y2={config.height - config.padding.bottom}
          />
        </g>
      );
    })}
    <line
      className="chart-grid-line-vertical"
      x1={config.padding.left + 7 * config.dayWidth}
      y1={config.padding.top}
      x2={config.padding.left + 7 * config.dayWidth}
      y2={config.height - config.padding.bottom}
    />
  </g>
);

const YAxis = ({ config }) => {
  // Calculate dynamic text positioning based on available space
  const getTextX = (textLength) => {
    // Base offset from the chart area
    const baseOffset = 10;
    // Calculate position to ensure text doesn't get cut off
    // For longer text like "Late Night Snack", position it closer to the chart
    const dynamicOffset = textLength > 10 ? 5 : 25;
    return Math.max(baseOffset, config.padding.left - dynamicOffset);
  };

  return (
    <g className="y-axis">
      {MEAL_TYPES.map((meal, mealIndex) => {
        const y = config.padding.top + mealIndex * config.mealHeight + config.mealHeight / 2;
        const textX = getTextX(meal.length);
        
        return (
          <g key={meal}>
            <text
              x={textX}
              y={y}
              fontSize={config.fontSize.mealLabel}
              textAnchor="end"
              className="y-axis-title"
            >
              {meal}
            </text>
            <line
              className="chart-grid-line-horizontal"
              x1={config.padding.left}
              y1={config.padding.top + mealIndex * config.mealHeight}
              x2={config.padding.left + 7 * config.dayWidth}
              y2={config.padding.top + mealIndex * config.mealHeight}
            />
          </g>
        );
      })}
      <line
        className="chart-grid-line-horizontal"
        x1={config.padding.left}
        y1={config.padding.top + 4 * config.mealHeight}
        x2={config.padding.left + 7 * config.dayWidth}
        y2={config.padding.top + 4 * config.mealHeight}
      />
    </g>
  );
};

const MealCell = ({ config, dayIndex, mealIndex, mealData, mealTime, isExpanded }) => {
  const x = config.padding.left + dayIndex * config.dayWidth + 5;
  const y = config.padding.top + mealIndex * config.mealHeight + 5;
  const cellWidth = config.dayWidth - 10;
  const cellHeight = config.mealHeight - 10;
  
  // Calculate grid layout for 6 circles (2x3 grid)
  const circlesPerRow = 3;
  const circleWidth = cellWidth / circlesPerRow;
  const circleHeight = (cellHeight - 20) / 2; // Reserve space for time
  
  // Calculate circle radius and emoji size based on cell dimensions
  const minDimension = Math.min(circleWidth, circleHeight);
  const circleRadius = Math.max(8, Math.min(16, minDimension * 0.35)); // Min 8px, max 16px, 35% of min dimension
  const emojiFontSize = Math.max(8, Math.min(16, minDimension * 0.4)); // Min 8px, max 16px, 40% of min dimension for better visibility
  
  // Apply expanded view scaling
  const expandedCircleRadius = isExpanded ? circleRadius * 1.3 : circleRadius;
  const expandedEmojiFontSize = isExpanded ? emojiFontSize * 1.4 : emojiFontSize;
  
  // Define the 6 food categories in order (5 main + 1 sugar)
  const allCategories = [...FOOD_CATEGORIES, 'Added Sugar'];
  
  return (
    <g className="meal-cell">
      {/* Background */}
      <rect
        x={x}
        y={y}
        width={cellWidth}
        height={cellHeight}
        fill="#f9f9f9"
        stroke="#ddd"
        strokeWidth="1"
      />
      
      {/* Meal time at the top */}
      <text
        x={x + cellWidth / 2}
        y={y + 12}
        fontSize={config.fontSize.timeLabel}
        textAnchor="middle"
        className="time-label"
      >
        {mealTime}
      </text>
      
      {/* 6 placeholder circles with food category emojis */}
      {allCategories.map((category, index) => {
        const row = Math.floor(index / circlesPerRow);
        const col = index % circlesPerRow;
        const circleX = x + col * circleWidth + circleWidth / 2;
        const circleY = y + 20 + row * circleHeight + circleHeight / 2;
        
        // Check if category is present
        let hasCategory = false;
        let emoji = '';
        
        if (category === 'Added Sugar') {
          hasCategory = mealData[category] && SUGAR_EMOJIS[mealData[category]];
          emoji = SUGAR_EMOJIS[mealData[category]] || '';
        } else {
          hasCategory = mealData[category];
          emoji = CATEGORY_EMOJIS[category] || '';
        }
        
        return (
          <g key={category}>
            {/* Placeholder circle - always grey */}
            <circle
              cx={circleX}
              cy={circleY}
              r={expandedCircleRadius}
              fill="#f5f5f5"
              stroke="#ddd"
              strokeWidth="1"
              opacity={0.3}
            />
            {/* Emoji if category is present */}
            {hasCategory && emoji && (
              <text
                x={circleX}
                y={circleY}
                fontSize={expandedEmojiFontSize}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}
              >
                {emoji}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

const MealGrid = ({ config, weekDays, patientData, isExpanded }) => {
  if (!patientData || patientData.length === 0) {
    return null;
  }

  return (
    <g className="meal-grid">
      {weekDays.map((day, dayIndex) => {
        const dayData = patientData.find(d => {
          const dataDate = new Date(d.Date);
          return dataDate.toDateString() === day.toDateString();
        });

        if (!dayData) {
          return null;
        }

        return MEAL_TYPES.map((meal, mealIndex) => {
          const mealData = getMealData(dayData, meal);
          const mealTime = getMealTime(dayData, meal);
          
          return (
            <MealCell
              key={`${dayIndex}-${mealIndex}`}
              config={config}
              dayIndex={dayIndex}
              mealIndex={mealIndex}
              mealData={mealData}
              mealTime={mealTime}
              isExpanded={isExpanded}
            />
          );
        });
      })}
    </g>
  );
};


// --- Main Component ---
const MealContentsChart = ({ patientId, isExpanded = false, onExpand, navigation, screenshotMode = false, showThreeMonthSummaries = false }) => {
  const { mealData: patientData, loading, error } = usePatientData(patientId);
  
  // Use navigation from parent or fallback to internal navigation
  const internalNavigation = useChartNavigation('mealContents');
  const nav = navigation || internalNavigation;
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(500);

  // Inline configuration for chart dimensions and styling
  const mealHeight = isExpanded ? 90 : 70;
  const dayWidth = isExpanded ? 100 : 70;
  const leftPadding = 140;
  
  const config = {
    width: leftPadding + (dayWidth * 7),
    height: (4 * mealHeight) + 50 + 100, // 4 meals + top + bottom padding
    padding: { top: 50, right: 40, bottom: 100, left: leftPadding },
    dayWidth: dayWidth,
    mealHeight: mealHeight,
    fontSize: {
      dayLabel: isExpanded ? 12 : 10,
      dateLabel: isExpanded ? 10 : 8,
      mealLabel: isExpanded ? 10 : 8,
      timeLabel: isExpanded ? 8 : 6,
    },
  };
  
  // Measure container width for sizing
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [isExpanded]);

  const { start: startOfWeek, end: endOfWeek } = nav.getDateRange();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  // Get 3-month data
  const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
  const threeMonthData = patientData.filter(d => {
    const dataDate = new Date(d.Date);
    return dataDate >= startOfThreeMonths && dataDate <= endOfThreeMonths;
  });

  // Calculate summary statistics for physician view
  let weekSummary = null;
  if (patientData && patientData.length > 0) {

    const weekData = patientData.filter(d => {
      const dataDate = new Date(d.Date);
      return dataDate >= startOfWeek && dataDate <= endOfWeek;
    });

    if (weekData.length === 0) return null;

    // Count food categories across all meals
    const categoryStats = {};
    FOOD_CATEGORIES.forEach(category => {
      categoryStats[category] = 0;
    });

    // Count sugar levels
    const sugarStats = {};
    SUGAR_CATEGORIES.filter(s => s !== '').forEach(sugar => {
      sugarStats[sugar] = 0;
    });

    let totalMealsLogged = 0;
    let daysWithMeals = new Set();

    weekData.forEach(dayData => {
      daysWithMeals.add(dayData.Date);
      
      MEAL_TYPES.forEach(meal => {
        const mealData = getMealData(dayData, meal);
        const hasAnyFood = FOOD_CATEGORIES.some(category => mealData[category]);
        
        if (hasAnyFood) {
          totalMealsLogged++;
          
          // Count each food category
          FOOD_CATEGORIES.forEach(category => {
            if (mealData[category]) {
              categoryStats[category]++;
            }
          });

          // Count sugar levels
          if (mealData['Added Sugar'] && mealData['Added Sugar'] !== '') {
            sugarStats[mealData['Added Sugar']]++;
          }
        }
      });
    });

    // Find most common food category
    const mostCommonFood = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate sugar frequency
    const totalSugarMeals = Object.values(sugarStats).reduce((sum, count) => sum + count, 0);
    const sugarPercentage = totalMealsLogged > 0 ? 
      ((totalSugarMeals / totalMealsLogged) * 100).toFixed(0) : 0;

    weekSummary = {
      totalMealsLogged,
      daysWithMeals: daysWithMeals.size,
      mostCommonFood: mostCommonFood[0],
      mostCommonFoodCount: mostCommonFood[1],
      categoryStats,
      sugarPercentage,
      totalSugarMeals
    };
  }

  // Calculate 3-month summary statistics for physician view
  let threeMonthSummary = null;
  if (threeMonthData && threeMonthData.length > 0) {

    // Count food categories across all meals
    const categoryStats = {};
    FOOD_CATEGORIES.forEach(category => {
      categoryStats[category] = 0;
    });

    // Count sugar levels
    const sugarStats = {};
    SUGAR_CATEGORIES.filter(s => s !== '').forEach(sugar => {
      sugarStats[sugar] = 0;
    });

    let totalMealsLogged = 0;
    let daysWithMeals = new Set();

    threeMonthData.forEach(dayData => {
      daysWithMeals.add(dayData.Date);
      
      MEAL_TYPES.forEach(meal => {
        const mealData = getMealData(dayData, meal);
        const hasAnyFood = FOOD_CATEGORIES.some(category => mealData[category]);
        
        if (hasAnyFood) {
          totalMealsLogged++;
          
          // Count each food category
          FOOD_CATEGORIES.forEach(category => {
            if (mealData[category]) {
              categoryStats[category]++;
            }
          });

          // Count sugar levels
          if (mealData['Added Sugar'] && mealData['Added Sugar'] !== '') {
            sugarStats[mealData['Added Sugar']]++;
          }
        }
      });
    });

    // Find most common food category
    const mostCommonFood = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate sugar frequency
    const totalSugarMeals = Object.values(sugarStats).reduce((sum, count) => sum + count, 0);
    const sugarPercentage = totalMealsLogged > 0 ? 
      ((totalSugarMeals / totalMealsLogged) * 100).toFixed(0) : 0;

    threeMonthSummary = {
      totalMealsLogged,
      daysWithMeals: daysWithMeals.size,
      mostCommonFood: mostCommonFood[0],
      mostCommonFoodCount: mostCommonFood[1],
      categoryStats,
      sugarPercentage,
      totalSugarMeals
    };
  }


  
  return (
      <div className="meal-contents-chart-container">
        <h3 className="chart-title">Meal Contents</h3>
        <h4 className="chart-subtitle">{nav.getFormattedDateRange()}</h4>
        <div className={`meal-chart-wrapper ${isExpanded ? 'expanded' : ''}`} ref={containerRef}>
          <svg 
            width={config.width} 
            height={config.height} 
            viewBox={`0 0 ${config.width} ${config.height}`} 
            className="meal-chart"
            style={{ maxWidth: '100%', height: 'auto' }}
          >
            <XAxis config={config} weekDays={weekDays} />
            <YAxis config={config} />
            <MealGrid 
              config={config} 
              weekDays={weekDays} 
              patientData={patientData} 
              isExpanded={isExpanded}
            />
          </svg>
        </div>
        
        <div className="meal-contents-legends-wrapper">
            <Legend 
              title="Food Categories" 
              items={FOOD_CATEGORIES.map(category => ({
                label: `${CATEGORY_EMOJIS[category]} ${category}`,
                color: null
              }))}
              hide={screenshotMode}
            />
            <Legend 
              title="Sugar Levels" 
              items={SUGAR_CATEGORIES.filter(sugar => sugar !== '').map(sugar => ({
                label: `${SUGAR_EMOJIS[sugar]} ${sugar}`,
                color: null
              }))}
              hide={screenshotMode}
            />
        </div>

        {/* Show summary for physician/unified view */}
        {weekSummary && (
          <div className="summary-container">
            <div className="chart-summary">
              <h4>Week Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Meals Logged:</span>
                  <span className="stat-value">
                    {weekSummary.totalMealsLogged}/28 possible
                  </span>
                </div>


                <div className="stat-item">
                  <span className="stat-label">Added Sugar:</span>
                  <span className="stat-value">
                    {weekSummary.sugarPercentage}% of meals ({weekSummary.totalSugarMeals}/{weekSummary.totalMealsLogged})
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Food Balance:</span>
                  <span className="stat-value">
                    {weekSummary.categoryStats && Object.entries(weekSummary.categoryStats)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([cat, count]) => `${CATEGORY_EMOJIS[cat]}${count}`)
                      .join(' ')}
                  </span>
                </div>
              </div>
            </div>
            
            {showThreeMonthSummaries && threeMonthSummary && (
              <div className="chart-summary">
                <h4>3-Month Summary</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Meals Logged:</span>
                    <span className="stat-value">
                      {threeMonthSummary.totalMealsLogged} meals
                    </span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Added Sugar:</span>
                    <span className="stat-value">
                      {threeMonthSummary.sugarPercentage}% of meals ({threeMonthSummary.totalSugarMeals}/{threeMonthSummary.totalMealsLogged})
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Food Balance:</span>
                    <span className="stat-value">
                      {threeMonthSummary.categoryStats && Object.entries(threeMonthSummary.categoryStats)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([cat, count]) => `${CATEGORY_EMOJIS[cat]}${count}`)
                        .join(' ')}
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

export default MealContentsChart;
