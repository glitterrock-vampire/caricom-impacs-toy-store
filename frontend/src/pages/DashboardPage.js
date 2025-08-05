import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import {
  Assessment as DashboardIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { Bar, Pie } from 'react-chartjs-2';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import api from '../services/api';

// Chart.js setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// World map URL
const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';

const DashboardPage = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    ordersThisWeek: Array(7).fill(0),
    categoryDistribution: {},
    customerLocations: []
  });
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [timeRange, setTimeRange] = useState('week');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, customersRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/customers')
      ]);
      
      // Ensure we have valid data before setting state
      if (statsRes?.data) {
        setStats({
          totalCustomers: statsRes.data.totalCustomers || 0,
          ordersThisWeek: Array.isArray(statsRes.data.ordersThisWeek) ? statsRes.data.ordersThisWeek : Array(7).fill(0),
          categoryDistribution: statsRes.data.categoryDistribution || {},
          customerLocations: Array.isArray(statsRes.data.customerLocations) ? statsRes.data.customerLocations : []
        });
      }
      
      if (customersRes?.data) {
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      setSnackbar({ open: true, message: 'Error loading dashboard data' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000); // 30 seconds
    }
    
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboardData]);

  // Handle customer selection
  const handleSelectionChange = (newSelection) => {
    setSelectedCustomers(newSelection);
  };

  // Handle customer deletion
  const handleDeleteCustomers = async () => {
    try {
      await Promise.all(
        selectedCustomers.map(id => 
          api.delete(`/api/customers/${id}`)
        )
      );
      
      setSnackbar({ open: true, message: 'Selected customers deleted successfully' });
      setDeleteDialogOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting customers:', err);
      setSnackbar({ open: true, message: 'Error deleting customers' });
    }
  };

  // Export to PDF
  const exportToPdf = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Customer Report', 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Customer data table
    doc.autoTable({
      head: [['ID', 'Name', 'Email', 'Country', 'Total Orders']],
      body: customers.map(customer => [
        customer.id,
        customer.name,
        customer.email,
        customer.country,
        customer.orderCount || 0
      ]),
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] }
    });
    
    // Save the PDF
    doc.save(`customer-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Chart data preparation with null checks
  const weeklyOrdersData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Orders',
        data: Array.isArray(stats?.ordersThisWeek) ? stats.ordersThisWeek : Array(7).fill(0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare category distribution data
  const categoryDistribution = stats?.categoryDistribution || {};
  const categoryData = {
    labels: Object.keys(categoryDistribution),
    datasets: [
      {
        data: Object.values(categoryDistribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'country', headerName: 'Country', width: 150 },
    { field: 'orderCount', headerName: 'Orders', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => {
            setSelectedCustomers([params.id]);
            setDeleteDialogOpen(true);
          }}
        >
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      ),
    },
  ];

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
    },
  };

  // Summary cards data
  const summaryCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: <DashboardIcon color="primary" />,
      color: 'primary',
    },
    {
      title: 'Orders This Week',
      value: Array.isArray(stats?.ordersThisWeek) ? 
        stats.ordersThisWeek.reduce((a, b) => a + b, 0) : 0,
      icon: <ShoppingCartIcon color="secondary" />,
      color: 'secondary',
    },
    {
      title: 'Categories',
      value: stats?.categoryDistribution ? 
        Object.keys(stats.categoryDistribution).length : 0,
      icon: <CategoryIcon color="success" />,
      color: 'success',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <DashboardIcon sx={{ mr: 1, fontSize: 30 }} color="primary" />
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
        </Box>
        <Box>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(e, newRange) => setTimeRange(newRange)}
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="week">This Week</ToggleButton>
            <ToggleButton value="month">This Month</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <ToggleButton
            value="auto"
            selected={autoRefresh}
            onChange={() => setAutoRefresh(!autoRefresh)}
            size="small"
            sx={{ mr: 2 }}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </ToggleButton>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">{card.value}</Typography>
                  </div>
                  <Box
                    sx={{
                      backgroundColor: `${card.color}.light`,
                      borderRadius: '50%',
                      width: 56,
                      height: 56,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { fontSize: 30 } })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Orders Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Weekly Orders</Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={weeklyOrdersData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Category Distribution</Typography>
              <Box sx={{ height: 300 }}>
                <Pie data={categoryData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* World Map */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Locations
              </Typography>
              <Box height={500} position="relative">
                <ComposableMap
                  projectionConfig={{ scale: 150 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#EAEAEC"
                          stroke="#D6D6DA"
                        />
                      ))
                    }
                  </Geographies>
                  {Array.isArray(stats?.customerLocations) && stats.customerLocations.map(({ country, count, coordinates }) => (
                    <Marker key={country} coordinates={coordinates}>
                      <circle
                        cx={0}
                        cy={0}
                        r={Math.min(5 + Math.sqrt(count) * 2, 15)}
                        fill="#FF6B6B"
                        fillOpacity={0.6}
                        stroke="#FF6B6B"
                        strokeWidth={1}
                      />
                      <text
                        textAnchor="middle"
                        y={-10}
                        style={{
                          fontFamily: 'system-ui',
                          fill: '#5D5A6D',
                          fontSize: 10,
                          fontWeight: 'bold',
                        }}
                      >
                        {country}
                      </text>
                    </Marker>
                  ))}
                </ComposableMap>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Customers</Typography>
              <Box>
                {selectedCustomers.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ mr: 2 }}
                  >
                    Delete ({selectedCustomers.length})
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PdfIcon />}
                  onClick={exportToPdf}
                >
                  Export PDF
                </Button>
              </Box>
            </Box>
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={customers}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                checkboxSelection
                onSelectionModelChange={handleSelectionChange}
                selectionModel={selectedCustomers}
                disableSelectionOnClick
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Customers</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedCustomers.length} selected customer(s)?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteCustomers}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbar({ ...snackbar, open: false })}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
};

export default DashboardPage;