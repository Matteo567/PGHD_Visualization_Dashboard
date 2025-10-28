# MCC Digital Health Data Visualizations

A React-based health data visualization dashboard for patients and physicians. This project demonstrates modern web development practices with a focus on clean architecture and reusable components.

## Project Overview

This application provides health data visualization with dual interfaces:
- **Patient View**: Personal health dashboard for individual patients
- **Physician View**: Clinical overview with analytical summaries

### Health Metrics Tracked

1. **Blood Glucose** - Daily readings with target range indicators
2. **Blood Pressure** - Multiple daily measurements with risk categorization
3. **Exercise** - Activity types, duration, and weekly summaries
4. **Mood Calendar** - Daily emotional state tracking in calendar format
5. **Pain** - Anatomical location mapping with 0-10 intensity scale
6. **Sleep** - Hours and quality ratings with trend analysis
7. **Meal Contents** - Nutritional component tracking and timing

## Tech Stack

### Core Technologies
- **React 18** - Functional components with hooks
- **PapaParse** - CSV data processing and parsing
- **PropTypes** - Runtime type checking

### Development Approach
- **Component Composition** - Reusable components with clear interfaces
- **Custom Hooks** - Reusable logic without external state management
- **Service Pattern** - Clean separation of data operations
- **Vanilla CSS** - Flexbox layouts with component-scoped styles

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd MCC_digital_health_data_visualizations

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── index.js                  # React app entry point
├── App.js                    # Main app with patient selection and screenshot mode
├── App.css                   # Global application styles
├── HealthDashboard.js       # Main dashboard component
├── PatientSelector.js        # Patient selection dropdown
├── services/
│   └── dataService.js        # Data loading, CSV parsing, and processing
├── hooks/
│   ├── usePatientData.js     # Patient data management with caching
│   ├── useVisualizations.js  # Visualization system management
│   ├── useChartNavigation.js # Chart navigation logic
│   ├── useDashboardState.js  # Dashboard state management
├── components/
│   ├── DashboardGrid.js      # Chart grid layout system
│   ├── VisualizationWrapper.js # Universal chart container
│   ├── PatientInfoCard.js    # Patient information display
│   ├── InfoBox.js            # Information display component
│   ├── ErrorBoundary.js      # React error boundary
│   ├── Legend.js             # Dynamic chart legend
│   ├── ChartStyles.css       # Shared chart styling
│   ├── ui/                   # Reusable UI components
│   │   ├── Placeholder.js    # Empty state placeholder
│   │   ├── Switch.js         # Toggle switch component
│   │   └── Tooltip.js        # Interactive chart tooltips
│   ├── chart-utils/          # Chart utility components
│   │   └── SharedYAxis.js    # Shared Y-axis component
│   └── patient_charts/       # Health visualization charts
│       ├── GlucoseChart.js   # Blood glucose tracking
│       ├── BloodPressureChart.js # BP monitoring
│       ├── ExerciseChart.js  # Activity tracking
│       ├── MoodCalendar.js   # Mood visualization
│       ├── PainChart.js      # Pain reporting with body mapping
│       ├── MealContentsChart.js # Nutrition tracking
│       ├── SleepChart.js     # Sleep pattern analysis
│       └── BodySvg.js        # Human body anatomical diagram
├── constants/
│   └── index.js              # App constants and configuration
```

## Application Architecture

### Component Hierarchy

```
App (Root)
├── Header (Patient selection & Screenshot mode toggle)
└── Main Content
    ├── Error Boundary
    └── Health Dashboard
        ├── Patient Info Card
        └── Dashboard Grid
            └── Visualization Wrappers
                ├── Chart Header (Title + Controls)
                ├── Chart Navigation (Previous/Next)
                └── Chart Content Area
                    └── Individual Chart Components
```

### Data Flow

1. **App.js** - Manages patient selection and screenshot mode
2. **HealthDashboard.js** - Main dashboard component with patient data
3. **DashboardGrid.js** - Organizes charts in grid layout
4. **VisualizationWrapper.js** - Provides consistent chart container
5. **Individual Charts** - Render specific health metric visualizations

### Key Components

- **DashboardGrid**: Flexible grid system that shows all available visualizations
- **VisualizationWrapper**: Universal container handling loading, error, and navigation states
- **usePatientData**: Custom hook for data fetching and caching
- **useVisualizations**: Manages available chart types and configurations

## Data Structure

### Synthetic Patient Data
- **100 Patients** with comprehensive health profiles
- **1 Year of Data** of data per patient (July 2024-July 2025)
- **70+ Data Fields** per patient per day

### Data Types
```javascript
// Example patient data structure
{
  patientInfo: {
    patientId: "Patient_001",
    age: 74,
    gender: "Female",
    conditions: ["Hypertension"],
    medications: [...]
  },
  glucoseData: [...],      // Multiple daily readings
  bloodPressureData: [...], // Timestamped measurements
  exerciseData: [...],     // Activity tracking
  moodData: [...],         // Daily mood entries
  painData: [...],         // Pain reports with location
  sleepData: [...],        // Sleep quality and duration
  mealData: [...]          // Meal composition data
}
```

## Chart Types & Visualization

### Custom SVG Visualizations
- **Line Charts**: Glucose trends over time
- **Bar Charts**: Blood pressure, exercise duration, sleep hours
- **Specialized**: Mood calendar, pain body map, meal timeline

### Chart Features
- **Interactive Tooltips**: Detailed information on hover
- **Color-Coded Legends**: Health range indicators
- **Time Navigation**: Week/month browsing with date ranges
- **Expandable Views**: Full-screen chart analysis

## Usage

### Switching Views
1. **Patient Selection**: Choose from 100 synthetic patients using the dropdown
2. **Screenshot Mode**: Toggle screenshot mode to hide UI elements for clean screenshots
3. **Chart Navigation**: Navigate through weeks/months using arrow buttons
4. **Chart Expansion**: Click expand to view charts in full screen

### Dashboard Features
- Personal health tracking dashboard for individual patients
- Educational information about health ranges
- Simple navigation interface
- Chart expansion capabilities
- Screenshot mode for presentations

## Development Features

### Code Quality
- Comprehensive file documentation
- Consistent component patterns
- Error boundaries and user feedback
- Data caching and efficient rendering

### Design System
- CSS custom properties for theming
- Flexible layouts using CSS Grid and Flexbox
- Component-scoped styling

## Data Generation

### Synthetic Data Script
- **`generate_synthetic_data.py`**: Python script generating 100 patient datasets
- **Comprehensive Coverage**: All health metrics with realistic patterns
- **CSV Output**: Individual patient files and combined dataset

## For Developers

- **Well-Documented**: Comprehensive file comments and inline documentation
- **Modular Design**: Reusable components with clear separation of concerns
- **Clean Architecture**: Service pattern, custom hooks, and component composition
