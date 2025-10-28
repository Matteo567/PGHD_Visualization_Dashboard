/**
 MoodCalendar.js - Mood Tracking Calendar Visualization
 
 This component provides comprehensive mood monitoring:
 - Daily mood tracking in calendar format
 - Color-coded mood states (happy, sad, angry)
 - Monthly navigation and trend analysis
 - Interactive mood selection and editing
 - Calendar layout
 - Integration with patient data and navigation
 
 Essential for mental health monitoring and emotional well-being tracking.
 */

import React, { useState, useRef } from 'react';
import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';
import Legend from '../Legend';

import './MoodCalendar.css';

// --- Constants & Config ---
const MOODS = { happy: '😊', sad: '😢', angry: '😠' };
const MOOD_COLORS = { 
  happy: 'var(--chart-color-mood-happy)', 
  sad: 'var(--chart-color-mood-sad)', 
  angry: 'var(--chart-color-mood-angry)' 
};
const MOOD_BACKGROUNDS = { 
  happy: 'var(--chart-color-mood-happy-bg)', 
  sad: 'var(--chart-color-mood-sad-bg)', 
  angry: 'var(--chart-color-mood-angry-bg)' 
};
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getCalendarConfig = (isExpanded) => ({
  svgWidth: isExpanded ? 700 : 350,
  svgHeight: isExpanded ? 600 : 300,
  cellWidth: isExpanded ? 100 : 50,
  cellHeight: isExpanded ? 85 : 44,
  dayLabelY: isExpanded ? 55 : 30,
  dayLabelFontSize: isExpanded ? 16 : 9,
  dateLabelX: isExpanded ? 12 : 5,
  dateLabelY: isExpanded ? 22 : 12,
  dateLabelFontSize: isExpanded ? 14 : 8,
  moodIconFontSize: isExpanded ? 36 : 20,
  startX: isExpanded ? 50 : 25,
  startY: isExpanded ? 100 : 55,
});

// --- Helper Functions ---
const normalizeMood = (mood) => (mood && MOODS[mood.toLowerCase()]) ? mood.toLowerCase() : null;
const getMoodEmoji = (mood) => MOODS[normalizeMood(mood)];
const getMoodColor = (mood) => MOOD_COLORS[normalizeMood(mood)];
const getMoodBackgroundColor = (mood) => MOOD_BACKGROUNDS[normalizeMood(mood)] || '#ffffff';

const moodLegendItems = Object.entries(MOODS).map(([mood, emoji]) => ({
  icon: emoji,
  label: mood.charAt(0).toUpperCase() + mood.slice(1),
  style: {
    backgroundColor: MOOD_BACKGROUNDS[mood],
    borderColor: MOOD_COLORS[mood],
  },
}));

// --- Sub-components ---

const CalendarHeader = ({ config }) => (
  <g className="calendar-header">
    {DAYS_OF_WEEK.map((day, i) => (
      <text 
        key={day} 
        x={config.startX + i * config.cellWidth} 
        y={config.dayLabelY} 
        className="day-name-label"
        style={{ fontSize: config.dayLabelFontSize }}
      >
        {day}
      </text>
    ))}
  </g>
);

const DayCell = ({ config, date, moods }) => {
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay();
  const weekOfMonth = Math.floor((dayOfMonth - 1 + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
  const x = config.startX + dayOfWeek * config.cellWidth;
  const y = config.startY + weekOfMonth * (config.cellHeight + 2);
  const primaryMood = moods.length > 0 ? moods[0] : null;

  return (
    <g className="day-cell-group" transform={`translate(${x - config.cellWidth / 2}, ${y - config.cellHeight / 2})`}>
      <rect width={config.cellWidth} height={config.cellHeight} fill={getMoodBackgroundColor(primaryMood)} className="day-cell-bg" />
      <text 
        x={config.dateLabelX} 
        y={config.dateLabelY} 
        className="date-label" 
        style={{ fontSize: config.dateLabelFontSize }}
      >
        {dayOfMonth}
      </text>
      {primaryMood && (
        <text 
          x={config.cellWidth / 2} 
          y={config.cellHeight * 0.65} 
          className="mood-icon" 
          fill={getMoodColor(primaryMood)}
          style={{ fontSize: config.moodIconFontSize }}
        >
          {getMoodEmoji(primaryMood)}
        </text>
      )}
    </g>
  );
};

const Calendar = ({ isExpanded, moodByDate, currentMonth, monthDisplay }) => {
  const config = getCalendarConfig(isExpanded);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="mood-calendar-svg-container">
      <h3 className="chart-title">Mood Calendar</h3>
      <h4 className="chart-subtitle">{monthDisplay}</h4>
      <svg viewBox={`0 0 ${config.svgWidth} ${config.svgHeight}`} className="mood-calendar-svg">
        <rect width={config.svgWidth} height={config.svgHeight} fill="white" />
        <CalendarHeader config={config} />
        <g className="calendar-body">
          {[...Array(daysInMonth)].map((_, i) => {
            const dayOfMonth = i + 1;
            const date = new Date(year, month, dayOfMonth);
            return <DayCell key={i} config={config} date={date} moods={moodByDate[dayOfMonth] || []} />;
          })}
        </g>
      </svg>
    </div>
  );
};

// --- Main Component ---
const MoodCalendar = ({ patientId, isExpanded = false, onExpand, viewMode = 'patient', navigation, screenshotMode = false }) => {
  const { moodData, isLoading: loading, error } = usePatientData(patientId, 'mood');
  
  // Use navigation from parent or fallback to internal navigation
  const useInternalNavigation = !navigation;
  const internalNavigation = useChartNavigation('mood');
  const nav = navigation || internalNavigation;
  
  const currentMonth = nav.currentDate;

  const moodByDate = moodData
    .filter(d => d.date.getFullYear() === currentMonth.getFullYear() && d.date.getMonth() === currentMonth.getMonth())
    .reduce((acc, item) => {
      const dateKey = item.date.getDate();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item.mood);
      return acc;
    }, {});

  const monthDisplay = nav.getFormattedDateRange();

  // Get 3-month data
  const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
  const threeMonthData = moodData.filter(d => d.date >= startOfThreeMonths && d.date <= endOfThreeMonths);

  // Calculate summary statistics for physician view
  const currentMonthData = moodData.filter(d => 
    d.date.getFullYear() === currentMonth.getFullYear() && 
    d.date.getMonth() === currentMonth.getMonth()
  );
  
  let monthSummary = null;
  if (currentMonthData.length > 0) {

    // Count mood occurrences
    const moodCounts = {};
    Object.keys(MOODS).forEach(mood => {
      moodCounts[mood] = 0;
    });

    currentMonthData.forEach(entry => {
      const normalizedMood = normalizeMood(entry.mood);
      if (normalizedMood && moodCounts[normalizedMood] !== undefined) {
        moodCounts[normalizedMood]++;
      }
    });

    // Find most common mood
    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate mood distribution percentages
    const totalEntries = currentMonthData.length;
    const moodPercentages = {};
    Object.entries(moodCounts).forEach(([mood, count]) => {
      moodPercentages[mood] = totalEntries > 0 ? ((count / totalEntries) * 100).toFixed(0) : 0;
    });

    // Days in current month
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const daysWithMood = new Set(currentMonthData.map(d => d.date.getDate())).size;

    // Calculate mood score (happy=3, sad=1, angry=1)
    const moodScore = (moodCounts.happy * 3 + moodCounts.sad * 1 + moodCounts.angry * 1) / totalEntries;
    const moodTrend = moodScore >= 2.5 ? 'Positive' : moodScore >= 1.5 ? 'Mixed' : 'Needs Attention';

    monthSummary = {
      totalEntries,
      daysWithMood,
      daysInMonth,
      mostCommonMood: mostCommonMood[0],
      mostCommonMoodCount: mostCommonMood[1],
      moodCounts,
      moodPercentages,
      moodTrend
    };
  }

  // Calculate 3-month summary statistics for physician view
  let threeMonthSummary = null;
  if (threeMonthData.length > 0) {

    // Count mood occurrences
    const moodCounts = {};
    Object.keys(MOODS).forEach(mood => {
      moodCounts[mood] = 0;
    });

    threeMonthData.forEach(entry => {
      const normalizedMood = normalizeMood(entry.mood);
      if (normalizedMood && moodCounts[normalizedMood] !== undefined) {
        moodCounts[normalizedMood]++;
      }
    });

    // Find most common mood
    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate mood distribution percentages
    const totalEntries = threeMonthData.length;
    const moodPercentages = {};
    Object.entries(moodCounts).forEach(([mood, count]) => {
      moodPercentages[mood] = totalEntries > 0 ? ((count / totalEntries) * 100).toFixed(0) : 0;
    });

    // Calculate actual days in the 3-month period
    const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
    const daysInThreeMonths = Math.ceil((endOfThreeMonths - startOfThreeMonths) / (1000 * 60 * 60 * 24)) + 1;
    const daysWithMood = new Set(threeMonthData.map(d => d.date.toDateString())).size;

    // Calculate mood score (happy=3, sad=1, angry=1)
    const moodScore = (moodCounts.happy * 3 + moodCounts.sad * 1 + moodCounts.angry * 1) / totalEntries;
    const moodTrend = moodScore >= 2.5 ? 'Positive' : moodScore >= 1.5 ? 'Mixed' : 'Needs Attention';

    threeMonthSummary = {
      totalEntries,
      daysWithMood,
      daysInThreeMonths,
      mostCommonMood: mostCommonMood[0],
      mostCommonMoodCount: mostCommonMood[1],
      moodCounts,
      moodPercentages,
      moodTrend
    };
  }

  return (
    <div className="mood-calendar-container">
      <div className={`mood-calendar-wrapper ${isExpanded ? 'expanded' : ''}`}>
        <Calendar isExpanded={isExpanded} moodByDate={moodByDate} currentMonth={currentMonth} monthDisplay={monthDisplay} />
      </div>
      <div className="mood-calendar-legend-wrapper">
          <Legend title="Mood" items={moodLegendItems} hide={screenshotMode} />
      </div>

      {/* Show summary for physician view only */}
      {viewMode === 'physician' && monthSummary && (
        <div className="summary-container">
          <div className="chart-summary">
            <h4>Month Summary</h4>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Mood Entries:</span>
                <span className="stat-value">
                  {monthSummary.totalEntries} entries
                </span>
              </div>

              <div className="stat-item">
                <span className="stat-label">Most Common Mood:</span>
                <span className="stat-value">
                  {MOODS[monthSummary.mostCommonMood]} {monthSummary.mostCommonMood.charAt(0).toUpperCase() + monthSummary.mostCommonMood.slice(1)} ({monthSummary.mostCommonMoodCount}x)
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mood Distribution:</span>
                <span className="stat-value">
                  😊{monthSummary.moodPercentages.happy}% 😢{monthSummary.moodPercentages.sad}% 😠{monthSummary.moodPercentages.angry}%
                </span>
              </div>

            </div>
          </div>
          
          {threeMonthSummary && (
            <div className="chart-summary">
              <h4>3-Month Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Mood Entries:</span>
                  <span className="stat-value">
                    {threeMonthSummary.totalEntries} entries
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Most Common Mood:</span>
                  <span className="stat-value">
                    {MOODS[threeMonthSummary.mostCommonMood]} {threeMonthSummary.mostCommonMood.charAt(0).toUpperCase() + threeMonthSummary.mostCommonMood.slice(1)} ({threeMonthSummary.mostCommonMoodCount}x)
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Mood Distribution:</span>
                  <span className="stat-value">
                    😊{threeMonthSummary.moodPercentages.happy}% 😢{threeMonthSummary.moodPercentages.sad}% 😠{threeMonthSummary.moodPercentages.angry}%
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

export default MoodCalendar;