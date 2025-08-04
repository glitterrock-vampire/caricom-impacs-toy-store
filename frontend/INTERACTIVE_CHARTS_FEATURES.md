# Interactive Charts Features

## Overview
The Toy Store Dashboard now includes interactive charts with multiple visualization types to make data analysis more engaging and insightful.

## New Features

### 1. Chart Type Selector
Each analytics modal now includes a toggle button group that allows users to switch between different chart types:
- **Bar Chart** - Great for comparing values across categories
- **Line Chart** - Perfect for showing trends over time
- **Pie Chart** - Ideal for showing proportions and percentages
- **Doughnut Chart** - A modern variation of pie charts with better readability

### 2. Interactive Chart Library
- Uses **Chart.js** with **react-chartjs-2** for high-performance, responsive charts
- Charts are fully interactive with hover effects, tooltips, and legends
- Responsive design that adapts to different screen sizes

### 3. Enhanced Modal Layout
- **Chart Type Selector**: Toggle buttons at the top of each modal
- **Interactive Chart**: Large chart area (8/12 grid) for better visibility
- **Statistics Card**: Compact statistics panel (4/12 grid) alongside the chart
- **Close Button**: Added close button in the modal header for better UX

### 4. Chart Data by Analytics Type

#### Orders Analysis
- **Data**: Monthly order trends (Jan-Jun)
- **Metrics**: Order counts over time
- **Best for**: Line charts to show growth trends

#### Revenue Analysis  
- **Data**: Revenue breakdown by channel
- **Categories**: Online Sales, In-Store Sales, Wholesale, Returns
- **Best for**: Pie/Doughnut charts to show revenue distribution

#### Customer Analytics
- **Data**: Customer segmentation
- **Categories**: New, Returning, VIP, Inactive customers
- **Best for**: Bar charts for customer type comparison

#### Average Order Value
- **Data**: Weekly AOV trends
- **Metrics**: Dollar values over 4-week period
- **Best for**: Line charts to track value changes

## Technical Implementation

### Dependencies Added
```bash
npm install react-chartjs-2 chart.js
```

### Chart.js Components Registered
- CategoryScale, LinearScale
- PointElement, LineElement, BarElement
- Title, Tooltip, Legend, ArcElement

### Key Components
- `getChartData()` - Generates chart data based on modal type
- `getChartOptions()` - Configures chart appearance and behavior
- `renderChart()` - Renders the appropriate chart type
- `handleChartTypeChange()` - Handles chart type switching

## Usage Instructions

1. **Open Dashboard**: Navigate to the main dashboard
2. **Click Analytics Card**: Click on any of the four main analytics cards
3. **Select Chart Type**: Use the toggle buttons to switch between chart types
4. **Interact with Chart**: Hover over data points for detailed information
5. **View Statistics**: Check the statistics panel for additional insights
6. **Export Data**: Use the "Export Report" button for data export

## Color Scheme
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #8b5cf6 (Purple) 
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)
- **Info**: #3b82f6 (Blue)

## Future Enhancements
- Real-time data updates
- Custom date range selection
- More chart types (scatter, radar, etc.)
- Data filtering and drill-down capabilities
- Chart export functionality
- Custom color themes
