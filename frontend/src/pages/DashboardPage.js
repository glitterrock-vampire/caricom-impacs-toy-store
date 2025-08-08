import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import { Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem, Select } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import {
  Alert, Avatar, Box, Button, Card, CardContent, CardHeader, Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, LinearProgress, List, ListItem, ListItemAvatar,
  ListItemText, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useTheme, Snackbar
} from '@mui/material';
import {
  Assessment as DashboardIcon, Refresh as RefreshIcon, Delete as DeleteIcon, PictureAsPdf as PdfIcon, Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon, Category as CategoryIcon, People as PeopleIcon, LocationOn as LocationIcon,
  Visibility as VisibilityIcon, TrendingUp as TrendingUpIcon, Info as InfoIcon, AttachMoney as MoneyIcon,
  Inventory as InventoryIcon, Notifications as NotificationsIcon, EventAvailable as EventIcon, PersonAdd as PersonAddIcon,
  AddShoppingCart as AddCartIcon, AssessmentOutlined as AnalyticsIcon, Timeline as TimelineIcon, BarChart as BarChartIcon,
  PieChart as PieChartIcon, Map as MapIcon, Email as EmailIcon
} from '@mui/icons-material';
import { Line, Pie } from 'react-chartjs-2';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import api from '../services/api';
import { dashboardService } from '../services/dashboardService';
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

// Chart.js setup
import {
  Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip as ChartTooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, Title, ChartTooltip, Legend, ArcElement, PointElement, LineElement, Filler);

// World map URL - Using a reliable CDN source
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const requestCache = new Map();

// Cache to store API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Retry logic with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Recent activities from orders
const getRecentActivities = (orders) => {
  return orders.slice(0, 5).map(order => ({
    id: order.id,
    type: 'order',
    user: order.customer?.name || 'Unknown',
    action: `placed order #${order.id}`,
    time: format(new Date(order.orderDate), 'MMM d, yyyy HH:mm'),
    icon: <ShoppingCartIcon color="primary" />
  }));
};

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0, totalOrders: 0, totalRevenue: 0, totalProducts: 0, orderGrowth: 0,
    monthlyOrders: [], recentOrders: [], statusBreakdown: {}
  });
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [timeRange, setTimeRange] = useState('week');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: location }, replace: true });
    } else {
      setInitialAuthCheck(true);
    }
  }, [location, navigate]);

  // Fetch dashboard data with debouncing and caching
  const fetchDashboardData = useCallback(debounce(async () => {
    if (!isAuthenticated()) return;
  
    const cacheKey = 'dashboard_data';
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      setStats(cachedData.stats);
      setCustomers(cachedData.customers);
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
  
      const token = localStorage.getItem('auth_token');
      const config = { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } };
  
      // Staggered API calls
      const statsRes = await retryWithBackoff(() => dashboardService.getDashboardStats());
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      const customersRes = await retryWithBackoff(() => api.get('/api/customers?limit=100', config));
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      const ordersRes = await retryWithBackoff(() => dashboardService.getRecentOrders());
  
      clearTimeout(timeoutId);
  
      const statsData = statsRes || {};
      const customersData = customersRes.data?.customers || [];
      const recentOrders = ordersRes || [];

      // Process customer data
      const processedCustomers = customersData.map(customer => ({
        id: customer.id,
        name: customer.name || 'Unknown',
        email: customer.email || 'No email',
        phone: customer.phone || 'No phone',
        country: customer.country || 'Unknown',
        orderCount: customer.orders?.length || 0,
        lastOrder: customer.orders?.[0]?.orderDate ? format(new Date(customer.orders[0].orderDate), 'MMM d, yyyy') : 'No orders',
        status: customer.status || 'active',
        createdAt: customer.createdAt ? format(new Date(customer.createdAt), 'MMM d, yyyy') : 'N/A'
      }));

      // Process status breakdown
      const statusBreakdown = {
        pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0,
        ...(statsData.statusBreakdown || {})
      };

      // Update state
      const newStats = {
        totalCustomers: statsData.totalCustomers || 0,
        totalOrders: statsData.totalOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
        totalProducts: statsData.totalProducts || 0,
        orderGrowth: statsData.orderGrowth || 0,
        monthlyOrders: statsData.monthlyOrders || [],
        recentOrders,
        statusBreakdown
      };

      setStats(newStats);
      setCustomers(processedCustomers);
      setError(null);

      // Cache the data
      cache.set(cacheKey, { stats: newStats, customers: processedCustomers, timestamp: Date.now() });

      if (loading) {
        setSnackbar({ open: true, message: 'Dashboard data loaded successfully', severity: 'success' });
      }
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      setError('Failed to load dashboard data');
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to load dashboard data', severity: 'error' });
      if (err.response?.status === 401) {
        localStorage.removeItem('auth_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, 500), [loading, navigate]);

  // Auto-refresh effect
  useEffect(() => {
    if (!initialAuthCheck || !isAuthenticated()) return;

    fetchDashboardData();
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        if (isAuthenticated()) {
          fetchDashboardData();
        } else {
          clearInterval(interval);
        }
      }, 5 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchDashboardData, initialAuthCheck]);

  // Handle customer selection
  const handleSelectionChange = (newSelection) => {
    setSelectedCustomers(newSelection);
  };

  // Handle customer deletion
  const handleDeleteCustomers = async () => {
    try {
      await Promise.all(selectedCustomers.map(id => api.delete(`/api/customers/${id}`)));
      setSnackbar({ open: true, message: 'Selected customers deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedCustomers([]);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting customers:', err);
      setSnackbar({ open: true, message: 'Error deleting customers', severity: 'error' });
    }
  };

  // Export to PDF
  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Customer Report', 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    doc.autoTable({
      head: [['ID', 'Name', 'Email', 'Country', 'Total Orders']],
      body: customers.map(customer => [customer.id, customer.name, customer.email, customer.country, customer.orderCount]),
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] }
    });
    
    doc.save(`customer-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Chart configurations
  const chartConfigurations = useMemo(() => ({
    lineChartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false } },
      scales: { y: { beginAtZero: true, grid: { drawBorder: false }, ticks: { precision: 0 } }, x: { grid: { display: false } } }
    },
    pieChartOptions: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  }), []);

  // KPI Cards
  const kpiCards = useMemo(() => [
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, change: stats.orderGrowth, icon: <MoneyIcon fontSize="large" color="primary" />, color: theme.palette.primary.main },
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), change: stats.orderGrowth, icon: <ShoppingCartIcon fontSize="large" color="secondary" />, color: theme.palette.secondary.main },
    { title: 'Total Customers', value: stats.totalCustomers.toLocaleString(), change: stats.orderGrowth, icon: <PeopleIcon fontSize="large" color="success" />, color: theme.palette.success.main },
    { title: 'Products in Stock', value: stats.totalProducts.toLocaleString(), change: 0, icon: <InventoryIcon fontSize="large" color="warning" />, color: theme.palette.warning.main }
  ], [stats, theme]);

  // Quick Actions
  const quickActions = [
    { label: 'New Order', icon: <AddCartIcon />, color: 'primary' },
    { label: 'Add Customer', icon: <PersonAddIcon />, color: 'secondary' },
    { label: 'View Reports', icon: <AnalyticsIcon />, color: 'info' },
    { label: 'Send Email', icon: <EmailIcon />, color: 'success' }
  ];

  // Chart data
  const chartData = useMemo(() => ({
    weeklyOrders: {
      labels: stats.monthlyOrders.map(item => item.month),
      datasets: [{
        label: 'Orders',
        data: stats.monthlyOrders.map(item => item.count),
        backgroundColor: 'rgba(63, 81, 181, 0.2)',
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    categoryDistribution: {
      labels: Object.keys(stats.statusBreakdown),
      datasets: [{
        data: Object.values(stats.statusBreakdown),
        backgroundColor: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
        borderWidth: 1
      }]
    }
  }), [stats, theme]);

  // Customer table columns
  const customerTableColumns = [
    { id: 'id', label: 'ID', minWidth: 70 },
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'email', label: 'Email', minWidth: 200 },
    { id: 'country', label: 'Country', minWidth: 120 },
    { id: 'orderCount', label: 'Orders', minWidth: 80, align: 'right' },
    { id: 'status', label: 'Status', minWidth: 100, format: (value) => <Chip label={value || 'active'} color={value === 'active' ? 'success' : 'default'} size="small" /> },
    { id: 'actions', label: 'Actions', minWidth: 100, align: 'right', format: (value, row) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedCustomers([row.id]); setDeleteDialogOpen(true); }}>
        <DeleteIcon fontSize="small" color="error" />
      </IconButton>
    )}
  ];

  // Order table columns
  const orderTableColumns = useMemo(() => [
    { id: 'orderNumber', label: 'Order #', minWidth: 120, format: (value, row) => <Link component={RouterLink} to={`/orders/${row.id}`} color="primary">{value}</Link> },
    { id: 'customer', label: 'Customer', minWidth: 200, format: (value) => value?.name || 'Guest' },
    { id: 'orderDate', label: 'Date', minWidth: 150, format: (value) => value ? format(new Date(value), 'MMM d, yyyy') : 'N/A' },
    { id: 'status', label: 'Status', minWidth: 120, format: (value) => (
      <Chip label={value || 'pending'} size="small" color={value === 'completed' ? 'success' : value === 'processing' ? 'primary' : value === 'pending' ? 'warning' : 'default'} variant="outlined" />
    )},
    { id: 'total', label: 'Total', minWidth: 120, align: 'right', format: (value) => `$${Number(value || 0).toFixed(2)}` },
    { id: 'actions', label: 'Actions', minWidth: 100, align: 'right', format: (value, row) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${row.id}`); }}>
        <VisibilityIcon fontSize="small" color="primary" />
      </IconButton>
    )}
  ], [navigate]);

  // Render Recent Activity Item
  const renderActivityItem = (activity) => (
    <ListItem key={activity.id} alignItems="flex-start" sx={{ px: 0 }}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.default' }}>{activity.icon}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography component="span" variant="subtitle2">{activity.user}{' '}<Typography component="span" variant="body2" color="textSecondary">{activity.action}</Typography></Typography>
        }
        secondary={<Typography variant="caption" color="textSecondary">{activity.time}</Typography>}
      />
    </ListItem>
  );

  // Render KPI Card
  const renderKpiCard = (card) => (
    <Card key={card.title} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[8] }}}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>{card.title}</Typography>
            <Typography variant="h5" component="div" fontWeight="bold">{card.value}</Typography>
          </Box>
          <Box sx={{ backgroundColor: `${card.color}20`, borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</Box>
        </Box>
        <Box display="flex" alignItems="center">
          <TrendingUpIcon color={card.change >= 0 ? 'success' : 'error'} fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" color={card.change >= 0 ? 'success.main' : 'error.main'} fontWeight="medium">{card.change >= 0 ? '+' : ''}{card.change}% vs last period</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Render Quick Action Button
  const renderQuickAction = (action) => (
    <Button key={action.label} variant="outlined" size="small" startIcon={action.icon} sx={{ flex: 1, minWidth: '120px', m: 0.5, py: 1, borderColor: `${action.color}.light`, color: `${action.color}.dark`, '&:hover': { backgroundColor: `${action.color}.light`, borderColor: `${action.color}.main` }}}>
      {action.label}
    </Button>
  );

  if (!initialAuthCheck || loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchDashboardData} startIcon={<RefreshIcon />}>Retry</Button>} sx={{ mb: 3 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Dashboard Overview</Typography>
          <Typography variant="body2" color="textSecondary">Welcome back! Here's what's happening with your store today.</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchDashboardData} disabled={loading}>Refresh</Button>
          <Button variant="contained" color="primary" size="small" startIcon={<PdfIcon />} onClick={exportToPdf}>Export</Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }} display="grid" gridTemplateColumns="repeat(12, 1fr)">
        {kpiCards.map(card => (
          <Grid 
            key={card.title} 
            item 
            xs={12} 
            sm={6} 
            md={3} 
            sx={{ display: 'flex' }}
            gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}
          >
            {renderKpiCard(card)}
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3, p: 1 }}>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}><TimelineIcon color="action" sx={{ mr: 1 }} /><Typography variant="subtitle2" color="textSecondary">Quick Actions</Typography></Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{quickActions.map(action => renderQuickAction(action))}</Box>
        </Box>
      </Card>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }} display="grid" gridTemplateColumns="repeat(12, 1fr)">
        <Grid item xs={12} md={8} gridColumn={{ xs: 'span 12', md: 'span 8' }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center"><BarChartIcon color="primary" sx={{ mr: 1 }} /><Typography variant="h6">Monthly Orders</Typography></Box>
              <ToggleButtonGroup value={timeRange} exclusive onChange={(e, newRange) => setTimeRange(newRange)} size="small">
                <ToggleButton value="week">Week</ToggleButton><ToggleButton value="month">Month</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ height: 300, position: 'relative' }}><Line data={chartData.weeklyOrders} options={chartConfigurations.lineChartOptions} /></Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 4' }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}><PieChartIcon color="primary" sx={{ mr: 1 }} /><Typography variant="h6">Order Status</Typography></Box>
            <Box sx={{ height: 300, position: 'relative' }}><Pie data={chartData.categoryDistribution} options={chartConfigurations.pieChartOptions} /></Box>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities and Recent Orders */}
      <Grid container spacing={3} sx={{ mb: 3 }} display="grid" gridTemplateColumns="repeat(12, 1fr)">
        <Grid item xs={12} md={6} gridColumn={{ xs: 'span 12', md: 'span 6' }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Recent Activities" titleTypographyProps={{ variant: 'h6' }} avatar={<NotificationsIcon color="primary" />} action={<IconButton size="small" onClick={fetchDashboardData}><RefreshIcon fontSize="small" /></IconButton>} />
            <Divider />
            <List sx={{ p: 0 }}>{getRecentActivities(stats.recentOrders).map(activity => renderActivityItem(activity))}</List>
            <Box textAlign="center" p={1}><Button size="small" color="primary">View All Activities</Button></Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} gridColumn={{ xs: 'span 12', md: 'span 6' }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Recent Orders"
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<ShoppingCartIcon color="primary" />}
              action={
                <Box display="flex" alignItems="center">
                  <ToggleButton value="auto" selected={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} size="small" sx={{ mr: 1 }}>
                    Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                  </ToggleButton>
                  <Button size="small" color="primary" startIcon={<RefreshIcon />} onClick={fetchDashboardData}>Refresh</Button>
                </Box>
              }
            />
            <Divider />
            <Box sx={{ width: '100%' }}>
              <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                  <Table>
                    <TableHead><TableRow>{orderTableColumns.map(column => <TableCell key={column.id}>{column.label}</TableCell>)}</TableRow></TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={orderTableColumns.length} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
                      ) : (!Array.isArray(stats.recentOrders) || stats.recentOrders.length === 0) ? (
                        <TableRow><TableCell colSpan={orderTableColumns.length} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">{!stats.recentOrders ? 'Failed to load orders' : 'No recent orders found'}</Typography>
                          {!stats.recentOrders && <Button variant="outlined" size="small" onClick={fetchDashboardData} sx={{ mt: 1 }}>Retry</Button>}
                        </TableCell></TableRow>
                      ) : (
                        stats.recentOrders.map((row, index) => {
                          if (!row || typeof row !== 'object') {
                            console.error('Invalid row data:', row);
                            return null;
                          }
                          const rowKey = row.id || `row-${index}`;
                          return (
                            <TableRow key={rowKey} hover sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' }}}                              onClick={(event) => { if (!event.target.closest('button') && event.target.type !== 'checkbox' && row.id) navigate(`/orders/${row.id}`); }}>
                              {orderTableColumns.map((column) => {
                                const cellKey = `${rowKey}-${column.id}`;
                                let cellContent = '';
                                try {
                                  const value = column.id in row ? row[column.id] : '';
                                  cellContent = column.format ? column.format(value, row) : (value ?? '');
                                } catch (error) {
                                  console.error(`Error rendering cell ${column.id}:`, error);
                                  cellContent = 'Error';
                                }
                                return <TableCell key={cellKey}>{cellContent}</TableCell>;
                              })}
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
                  <Box><Button variant="outlined" size="small" startIcon={<FileDownloadIcon />} onClick={() => console.log('Export data')}>Export</Button></Box>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>Rows per page:</Typography>
                    <Select size="small" value={5} onChange={(e) => console.log('Page size changed to:', e.target.value)} sx={{ minWidth: 80, mr: 2 }}>
                      <MenuItem value={5}>5</MenuItem><MenuItem value={10}>10</MenuItem><MenuItem value={20}>20</MenuItem>
                    </Select>
                    <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>Page 1 of 1</Typography>
                    <IconButton size="small" disabled><KeyboardArrowLeft /></IconButton>
                    <IconButton size="small" disabled><KeyboardArrowRight /></IconButton>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Locations Map */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Customer Locations" titleTypographyProps={{ variant: 'h6' }} avatar={<MapIcon color="primary" />} />
        <Divider />
        <Box sx={{ height: 400, width: '100%', p: 2 }}>
          <ComposableMap projectionConfig={{ scale: 150, center: [0, 20] }} style={{ width: '100%', height: '100%' }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) => geographies.map(geo => (
                <Geography key={geo.rsmKey} geography={geo} fill="#EAEAEC" stroke="#D6D6DA" style={{ default: { outline: 'none' }, hover: { fill: '#E5E5E5', outline: 'none' }, pressed: { outline: 'none' } }} />
              ))}
            </Geographies>
            {stats.customerLocations?.map((location, index) => (
              <Marker key={index} coordinates={[location.lng, location.lat]}>
                <circle cx={0} cy={0} r={5} fill={theme.palette.primary.main} stroke="#fff" strokeWidth={1} />
                <text textAnchor="middle" y={-10} style={{ fontFamily: 'system-ui', fill: theme.palette.text.primary, fontSize: 10, fontWeight: 'bold' }}>{location.count}</text>
              </Marker>
            ))}
          </ComposableMap>
        </Box>
      </Card>

      {/* Customer Table */}
      <Card sx={{ mb: 3 }}>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Customers</Typography>
          <Box>
            {selectedCustomers.length > 0 && (
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDialogOpen(true)} sx={{ mr: 2 }}>
                Delete ({selectedCustomers.length})
              </Button>
            )}
            <Button variant="contained" color="primary" startIcon={<PdfIcon />} onClick={exportToPdf}>Export PDF</Button>
          </Box>
        </Box>
        <Box sx={{ width: '100%' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Phone</TableCell><TableCell>Orders</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
                ) : customers.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography variant="body1" color="text.secondary">No customers found</Typography></TableCell></TableRow>
                ) : (
                  customers.map(customer => (
                    <TableRow key={customer.id} hover onClick={() => navigate(`/customers/${customer.id}`)} sx={{ cursor: 'pointer' }}>
                      <TableCell>{customer.id}</TableCell><TableCell>{customer.name}</TableCell><TableCell>{customer.email}</TableCell><TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.orderCount}</TableCell><TableCell><Chip label={customer.status || 'active'} color={customer.status === 'active' ? 'success' : 'default'} size="small" /></TableCell>
                      <TableCell><IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer.id}`); }}><VisibilityIcon fontSize="small" /></IconButton></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Button startIcon={<KeyboardArrowLeft />} disabled size="small" sx={{ mr: 1 }}>Previous</Button>
            <Button endIcon={<KeyboardArrowRight />} disabled size="small">Next</Button>
          </Box>
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Customers</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to delete {selectedCustomers.length} selected customer(s)? This action cannot be undone.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCustomers} color="error" variant="contained" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Global Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default DashboardPage;