# Patient-Generated Health Data Visualization Dashboard

A React-based dashboard for visualizing patient-generated health data. The dashboard displays health metrics for patients with multiple chronic conditions and supports viewing by both patients and healthcare providers.

## Live Dashboard

[View Live Dashboard](https://matteo567.github.io/PGHD_Visualization_Dashboard/)

The dashboard includes 100 synthetic patients with one year of health data.

## Project Overview

This application visualizes health data collected by patients. The dashboard works for both patients and physicians, with different views based on access level.

Access levels:
- Admin: Full access to all charts
- Physician: Clinical view without meal contents chart
- Patient: Simplified view for personal health tracking

### Health Metrics Tracked

The dashboard displays seven types of health data:

1. Blood Glucose - Daily readings with target range indicators
2. Blood Pressure - Multiple daily measurements with risk categorization
3. Exercise - Activity types, duration, and weekly summaries
4. Mood Calendar - Daily emotional state tracking in calendar format
5. Pain - Anatomical location mapping with 0-10 intensity scale
6. Sleep - Hours and quality ratings with trend analysis
7. Meal Contents - Nutritional component tracking and timing

## Tech Stack

### Core Technologies
- React 18 - Functional components with hooks
- PapaParse - CSV data processing and parsing
- Vanilla CSS - Component-scoped styles with Flexbox and Grid layouts

### Development Approach
- Component composition with reusable components
- Custom hooks for reusable logic
- Service pattern for data operations
- No external state management library

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd PGHD_Visualization_Dashboard

# Install dependencies
npm install

# Start development server
npm start
```

The application opens at `http://localhost:3000`

## Project Structure

```
src/
├── index.js                  # React app entry point
├── App.js                    # Main app with patient selection and access type
├── App.css                   # Global application styles
├── HealthDashboard.js        # Main dashboard component
├── PatientSelector.js        # Patient selection dropdown
├── AccessTypeSelector.js     # Access type selection component
├── services/
│   └── dataService.js        # Data loading, CSV parsing, and processing
├── hooks/
│   ├── usePatientData.js     # Patient data management
│   ├── useVisualizations.js  # Visualization system management
│   ├── useChartNavigation.js # Chart navigation logic
│   └── useDashboardState.js  # Dashboard state management
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
├── Header (Access type selector & Patient selection)
└── Main Content
    ├── Error Boundary
    └── Health Dashboard
        ├── Patient Info Card
        ├── Dashboard Controls (QR code & summary toggle)
        └── Dashboard Grid
            └── Visualization Wrappers
                ├── Chart Header (Title + Controls)
                ├── Chart Navigation (Previous/Next)
                └── Chart Content Area
                    └── Individual Chart Components
```

### Data Flow

1. App.js manages patient selection and access type
2. HealthDashboard.js loads patient data and manages dashboard state
3. DashboardGrid.js organizes charts in a responsive grid
4. VisualizationWrapper.js provides consistent chart container with navigation
5. Individual chart components render specific health metric visualizations

### Key Components

- DashboardGrid: Grid system that displays available visualizations
- VisualizationWrapper: Container handling loading, error, and navigation states
- usePatientData: Custom hook for fetching and caching patient data from CSV files
- useVisualizations: Manages available chart types based on data availability

## Data Structure

### Synthetic Patient Data

The project includes synthetic data for testing and demonstration:
- 100 patients with health profiles
- One year of data per patient (July 2024 to July 2025)
- 70+ data fields per patient per day

### Data Types

Patient data includes the following structure:

```javascript
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

The dashboard uses custom SVG-based visualizations:

- Line Charts: Glucose trends over time
- Bar Charts: Blood pressure, exercise duration, sleep hours
- Specialized Visualizations: Mood calendar, pain body map, meal timeline

Chart features:
- Interactive tooltips with detailed information on hover
- Color-coded legends showing health range indicators
- Time navigation for week or month browsing
- Expandable views for full-screen chart analysis
- Three-month summary toggle for long-term trend analysis

## Usage

### Using the Dashboard

1. Select Access Type: Choose Admin, Physician, or Patient from the dropdown
2. Select Patient: Choose from 100 synthetic patients using the patient selector
3. View Charts: Scroll through the dashboard to see available health metrics
4. Navigate Time Periods: Use arrow buttons on charts to navigate weeks or months
5. Expand Charts: Click the expand button to view charts in full screen
6. Toggle Summaries: Use the summary toggle to show or hide 3-month summaries

### Dashboard Features

- Personal health tracking for individual patients
- Educational information about health ranges and targets
- Time-based navigation for viewing historical data
- Chart expansion for detailed analysis
- Access-level appropriate views

## Development

### Code Organization

The codebase follows these patterns:
- File-level documentation explaining component purpose
- Consistent component patterns throughout
- Error boundaries for user feedback
- Data caching to reduce redundant fetches

### Styling

- CSS custom properties for theming
- Flexible layouts using CSS Grid and Flexbox
- Component-scoped CSS files

## Data Generation

### Synthetic Data Script

The project includes a Python script for generating synthetic patient data:

- `generate_synthetic_data.py`: Generates 100 patient datasets with one year of data
- Creates CSV files in `public/synthetic_patients/` directory
- Includes realistic health patterns based on chronic condition prevalence
- Generates individual patient files and a combined dataset

To generate data, run:
```bash
python generate_synthetic_data.py
```

The script uses data from the `Data_details/` directory including:
- Medication lists
- Condition definitions
- Name lists
- Health range descriptions

## Credits & Acknowledgments

### Development Tools & Technologies

All our digital visualizations in the dashboard (our "visualization system") were created in the Cursor interactive development environment, using JavaScript with the React framework (React 18.2.0 / React DOM 18.2.0 for the frontend, built with Create React App (react-scripts 5.0.1) and employing PapaParse 5.4.1 for CSV parsing, alongside HTML and CSS for layout and styling.

### Open Source Libraries

This project uses the following open-source libraries:
- **React** (^18.2.0) - UI framework
- **React DOM** (^18.2.0) - React rendering for the web
- **PapaParse** (^5.4.1) - Powerful CSV parsing library
- **Create React App** (react-scripts ^5.0.1) - Build tooling and development environment
