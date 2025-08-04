import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  ShoppingCart,
  AttachMoney,
  People,
  TrendingUp,
  ZoomIn,
  BarChart,
  Timeline,
  PieChart,
  Close,
  Category,
  LocationOn,
} from '@mui/icons-material';
import DetailedBreakdownModal from './DetailedBreakdownModal';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const DashboardDetailModal = ({ open, onClose, type, data }) => {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalType, setDetailModalType] = useState(null);
  const [detailModalSubType, setDetailModalSubType] = useState(null);
  const [chartType, setChartType] = useState('bar');

  const handleDetailClick = (subType) => {
    setDetailModalType(type);
    setDetailModalSubType(subType);
    setDetailModalOpen(true);
  };

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Generate chart data based on modal type
  const getChartData = () => {
    const colors = {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    };

    switch (type) {
      case 'orders':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Orders',
              data: [65, 59, 80, 81, 56, 76],
              backgroundColor: chartType === 'pie' || chartType === 'doughnut'
                ? [colors.primary, colors.secondary, colors.success, colors.warning, colors.error, colors.info]
                : colors.primary,
              borderColor: colors.primary,
              borderWidth: 2,
              fill: chartType === 'line' ? false : true,
            },
          ],
        };

      case 'revenue':
        return {
          labels: ['Online Sales', 'In-Store Sales', 'Wholesale', 'Returns'],
          datasets: [
            {
              label: 'Revenue ($)',
              data: [8950, 3500, 2200, -450],
              backgroundColor: chartType === 'pie' || chartType === 'doughnut'
                ? [colors.success, colors.primary, colors.warning, colors.error]
                : colors.success,
              borderColor: colors.success,
              borderWidth: 2,
              fill: chartType === 'line' ? false : true,
            },
          ],
        };

      case 'customers':
        return {
          labels: ['New', 'Returning', 'VIP', 'Inactive'],
          datasets: [
            {
              label: 'Customers',
              data: [45, 89, 12, 23],
              backgroundColor: chartType === 'pie' || chartType === 'doughnut'
                ? [colors.info, colors.primary, colors.warning, colors.error]
                : colors.info,
              borderColor: colors.info,
              borderWidth: 2,
              fill: chartType === 'line' ? false : true,
            },
          ],
        };

      case 'avgOrderValue':
      case 'avg_order':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Average Order Value ($)',
              data: [125, 135, 142, 138],
              backgroundColor: chartType === 'pie' || chartType === 'doughnut'
                ? [colors.warning, colors.primary, colors.success, colors.secondary]
                : colors.warning,
              borderColor: colors.warning,
              borderWidth: 2,
              fill: chartType === 'line' ? false : true,
            },
          ],
        };

      default:
        return {
          labels: ['Data 1', 'Data 2', 'Data 3', 'Data 4'],
          datasets: [
            {
              label: 'Values',
              data: [10, 20, 30, 40],
              backgroundColor: colors.primary,
              borderColor: colors.primary,
              borderWidth: 2,
            },
          ],
        };
    }
  };

  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${getModalTitle()} - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        },
      },
      scales: chartType === 'pie' || chartType === 'doughnut' ? {} : {
        y: {
          beginAtZero: true,
        },
      },
    };
  };

  const renderChart = () => {
    const chartData = getChartData();
    const options = getChartOptions();

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  const handleDetailClose = () => {
    setDetailModalOpen(false);
    setDetailModalType(null);
    setDetailModalSubType(null);
  };

  const getModalTitle = () => {
    switch (type) {
      case 'orders':
        return 'Total Orders Analysis';
      case 'revenue':
        return 'Revenue Analysis';
      case 'customers':
        return 'Customer Locations Deep Analysis';
      case 'avgOrderValue':
      case 'avg_order':
        return 'Average Order Value Analysis';
      default:
        return 'Analytics';
    }
  };

  const getModalContent = () => {
    switch (type) {
      case 'orders':
        return {
          title: 'Total Orders Analysis',
          icon: <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />,
          content: (
            <Grid container spacing={3}>
              {/* Chart Type Selector */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mb={2}>
                  <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={handleChartTypeChange}
                    aria-label="chart type"
                    size="small"
                  >
                    <ToggleButton value="bar" aria-label="bar chart">
                      <BarChart sx={{ mr: 1 }} />
                      Bar
                    </ToggleButton>
                    <ToggleButton value="line" aria-label="line chart">
                      <Timeline sx={{ mr: 1 }} />
                      Line
                    </ToggleButton>
                    <ToggleButton value="pie" aria-label="pie chart">
                      <PieChart sx={{ mr: 1 }} />
                      Pie
                    </ToggleButton>
                    <ToggleButton value="doughnut" aria-label="doughnut chart">
                      <PieChart sx={{ mr: 1 }} />
                      Doughnut
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>

              {/* Interactive Chart */}
              <Grid item xs={12} md={8}>
                <Card sx={{ height: 400, p: 2 }}>
                  <Box height="100%">
                    {renderChart()}
                  </Box>
                </Card>
              </Grid>

              {/* Statistics Card */}
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    }
                  }}
                  onClick={() => handleDetailClick('trends')}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Order Trends
                      </Typography>
                      <IconButton size="small" color="primary">
                        <ZoomIn />
                      </IconButton>
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">This Month</Typography>
                        <Typography variant="body2" fontWeight="bold">156 orders</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={85} />
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Last Month</Typography>
                        <Typography variant="body2" fontWeight="bold">139 orders</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={75} />
                    </Box>
                    <Chip 
                      icon={<TrendingUp />}
                      label="+12% vs last month" 
                      color="success" 
                      size="small" 
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    }
                  }}
                  onClick={() => handleDetailClick('categories')}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Top Selling Categories
                      </Typography>
                      <IconButton size="small" color="primary">
                        <ZoomIn />
                      </IconButton>
                    </Box>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Category color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Building Blocks" 
                          secondary="45 orders this month" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Category color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Action Figures" 
                          secondary="38 orders this month" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Category color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Educational Toys" 
                          secondary="32 orders this month" 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )
        };

      case 'revenue':
        return {
          title: 'Revenue Analysis',
          icon: <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />,
          content: (
            <Grid container spacing={3}>
              {/* Chart Type Selector */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mb={2}>
                  <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={handleChartTypeChange}
                    aria-label="chart type"
                    size="small"
                  >
                    <ToggleButton value="bar" aria-label="bar chart">
                      <BarChart sx={{ mr: 1 }} />
                      Bar
                    </ToggleButton>
                    <ToggleButton value="line" aria-label="line chart">
                      <Timeline sx={{ mr: 1 }} />
                      Line
                    </ToggleButton>
                    <ToggleButton value="pie" aria-label="pie chart">
                      <PieChart sx={{ mr: 1 }} />
                      Pie
                    </ToggleButton>
                    <ToggleButton value="doughnut" aria-label="doughnut chart">
                      <PieChart sx={{ mr: 1 }} />
                      Doughnut
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>

              {/* Interactive Chart */}
              <Grid item xs={12} md={8}>
                <Card sx={{ height: 400, p: 2 }}>
                  <Box height="100%">
                    {renderChart()}
                  </Box>
                </Card>
              </Grid>

              {/* Statistics Card */}
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    }
                  }}
                  onClick={() => handleDetailClick('breakdown')}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Revenue Breakdown
                      </Typography>
                      <IconButton size="small" color="primary">
                        <ZoomIn />
                      </IconButton>
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue: <strong>${data?.total_revenue?.toLocaleString() || '12,450.00'}</strong>
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Online Sales</Typography>
                        <Typography variant="body2" fontWeight="bold">$8,950</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={72} color="success" />
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">In-Store Sales</Typography>
                        <Typography variant="body2" fontWeight="bold">$3,500</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={28} color="info" />
                    </Box>
                    <Chip 
                      icon={<TrendingUp />}
                      label="+8% vs last month" 
                      color="success" 
                      size="small" 
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Revenue Products
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="LEGO Creator Set" 
                          secondary="$1,250 revenue" 
                        />
                        <Chip label="$89.99" size="small" color="success" />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Remote Control Car" 
                          secondary="$980 revenue" 
                        />
                        <Chip label="$79.99" size="small" color="success" />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Educational Puzzle" 
                          secondary="$750 revenue" 
                        />
                        <Chip label="$24.99" size="small" color="success" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )
        };

      case 'customers':
        return {
          title: 'Customer Analytics',
          icon: <People sx={{ fontSize: 40, color: 'secondary.main' }} />,
          content: (
            <Grid container spacing={3}>
              {/* Chart Type Selector */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mb={2}>
                  <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={handleChartTypeChange}
                    aria-label="chart type"
                    size="small"
                  >
                    <ToggleButton value="bar" aria-label="bar chart">
                      <BarChart sx={{ mr: 1 }} />
                      Bar
                    </ToggleButton>
                    <ToggleButton value="line" aria-label="line chart">
                      <Timeline sx={{ mr: 1 }} />
                      Line
                    </ToggleButton>
                    <ToggleButton value="pie" aria-label="pie chart">
                      <PieChart sx={{ mr: 1 }} />
                      Pie
                    </ToggleButton>
                    <ToggleButton value="doughnut" aria-label="doughnut chart">
                      <PieChart sx={{ mr: 1 }} />
                      Doughnut
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>

              {/* Interactive Chart */}
              <Grid item xs={12} md={8}>
                <Card sx={{ height: 400, p: 2 }}>
                  <Box height="100%">
                    {renderChart()}
                  </Box>
                </Card>
              </Grid>

              {/* Statistics Card */}
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    }
                  }}
                  onClick={() => handleDetailClick('growth')}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Customer Growth
                      </Typography>
                      <IconButton size="small" color="primary">
                        <ZoomIn />
                      </IconButton>
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Total Customers: <strong>{data?.total_customers || '89'}</strong>
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">New This Month</Typography>
                        <Typography variant="body2" fontWeight="bold">12 customers</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={60} color="secondary" />
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Returning Customers</Typography>
                        <Typography variant="body2" fontWeight="bold">77 customers</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={85} color="primary" />
                    </Box>
                    <Chip 
                      icon={<TrendingUp />}
                      label="+15% vs last month" 
                      color="success" 
                      size="small" 
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    }
                  }}
                  onClick={() => handleDetailClick('locations')}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Top Customer Locations
                      </Typography>
                      <IconButton size="small" color="primary">
                        <ZoomIn />
                      </IconButton>
                    </Box>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><LocationOn color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Jamaica" 
                          secondary="32 customers" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationOn color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Trinidad & Tobago" 
                          secondary="28 customers" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationOn color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Barbados" 
                          secondary="18 customers" 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )
        };

      case 'avg_order':
        return {
          title: 'Average Order Value Analysis',
          icon: <TrendingUp sx={{ fontSize: 40, color: 'warning.main' }} />,
          content: (
            <Grid container spacing={3}>
              {/* Chart Type Selector */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mb={2}>
                  <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={handleChartTypeChange}
                    aria-label="chart type"
                    size="small"
                  >
                    <ToggleButton value="bar" aria-label="bar chart">
                      <BarChart sx={{ mr: 1 }} />
                      Bar
                    </ToggleButton>
                    <ToggleButton value="line" aria-label="line chart">
                      <Timeline sx={{ mr: 1 }} />
                      Line
                    </ToggleButton>
                    <ToggleButton value="pie" aria-label="pie chart">
                      <PieChart sx={{ mr: 1 }} />
                      Pie
                    </ToggleButton>
                    <ToggleButton value="doughnut" aria-label="doughnut chart">
                      <PieChart sx={{ mr: 1 }} />
                      Doughnut
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>

              {/* Interactive Chart */}
              <Grid item xs={12} md={8}>
                <Card sx={{ height: 400, p: 2 }}>
                  <Box height="100%">
                    {renderChart()}
                  </Box>
                </Card>
              </Grid>

              {/* Statistics Card */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Value Trends
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Current AOV: <strong>${data?.avg_order_value?.toFixed(2) || '79.85'}</strong>
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">High Value Orders (&gt;$100)</Typography>
                        <Typography variant="body2" fontWeight="bold">23%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={23} color="success" />
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Medium Value ($50-$100)</Typography>
                        <Typography variant="body2" fontWeight="bold">45%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={45} color="warning" />
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Low Value (&lt;$50)</Typography>
                        <Typography variant="body2" fontWeight="bold">32%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={32} color="info" />
                    </Box>
                    <Chip 
                      icon={<TrendingUp />}
                      label="+5% vs last month" 
                      color="success" 
                      size="small" 
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Insights
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Peak Order Time" 
                          secondary="2:00 PM - 4:00 PM" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Average Items per Order" 
                          secondary="2.3 items" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Most Popular Day" 
                          secondary="Saturday" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Repeat Customer Rate" 
                          secondary="68%" 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )
        };

      default:
        return {
          title: 'Dashboard Details',
          icon: <TrendingUp sx={{ fontSize: 40 }} />,
          content: <Typography>No details available</Typography>
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            {modalContent.icon}
            <Box ml={2}>
              <Typography variant="h5" component="h2">
                {modalContent.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed insights and analytics • Click sections with 🔍 for deeper analysis
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="large">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {modalContent.content}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button variant="contained">
          Export Report
        </Button>
      </DialogActions>

      {/* Detailed Breakdown Modal */}
      <DetailedBreakdownModal
        open={detailModalOpen}
        onClose={handleDetailClose}
        type={detailModalType}
        subType={detailModalSubType}
        data={data}
      />
    </Dialog>
  );
};

export default DashboardDetailModal;
