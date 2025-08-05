import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, Snackbar, Alert, CircularProgress, Card, CardContent,
  Chip, Avatar, IconButton, Menu, MenuItem, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Grid, useTheme, useMediaQuery
} from '@mui/material';
import { 
  Add, MoreVert, Email, Phone, LocationOn, ShoppingCart, 
  TrendingUp, Visibility, Edit, Delete, Download
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '../theme/muiTheme';
import { customerService } from '../services/customerService';
import { reportService } from '../services/reportService';
import { format } from 'date-fns';
import { Add as AddIcon } from '@mui/icons-material';
import CustomerDetailCard from '../components/CustomerDetailCard';


// Status options for filtering
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'vip', label: 'VIP' },
  { value: 'new', label: 'New' },
];

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCustomer, setMenuCustomer] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleViewCustomerOrders = (customerId) => {
    navigate(`/orders?customerId=${customerId}`);
  };

  const handleViewCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  }, []);

  const handleMenuClick = useCallback((event, customer) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuCustomer(customer);
  }, []);

// Columns for the data grid
const columns = [
  {
    field: 'name',
    headerName: 'Customer',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {params.row.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="body1" noWrap>{params.row.name}</Typography>
          <Typography variant="body2" color="textSecondary" noWrap>{params.row.email}</Typography>
        </Box>
      </Box>
    ),
  },
  {
    field: 'phone',
    headerName: 'Phone',
    flex: 0.8,
    minWidth: 120,
  },
  {
    field: 'totalOrders',
    headerName: 'Orders',
    type: 'number',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'totalSpent',
    headerName: 'Total Spent',
    type: 'number',
    width: 130,
    valueFormatter: (params) => `$${params.value?.toFixed(2) || '0.00'}`,
    headerAlign: 'right',
    align: 'right',
  },
  {
    field: 'lastOrder',
    headerName: 'Last Order',
    type: 'date',
    flex: 0.8,
    minWidth: 120,
    valueFormatter: (params) => 
      params.value ? format(new Date(params.value), 'MMM d, yyyy') : 'Never',
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.7,
    minWidth: 100,
    renderCell: (params) => {
      const status = params.value?.toLowerCase();
      const colorMap = {
        active: 'success',
        inactive: 'default',
        vip: 'warning',
        new: 'info',
      };
      return (
        <Chip 
          label={status} 
          color={colorMap[status] || 'default'}
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    type: 'actions',
    width: 100,
    getActions: (params) => [
      <IconButton 
        size="small" 
        onClick={() => handleViewCustomer(params.row)}
        title="View details"
      >
        <Visibility fontSize="small" />
      </IconButton>,
      <IconButton 
        size="small" 
        onClick={(e) => handleMenuClick(e, params.row)}
        title="More actions"
      >
        <MoreVert fontSize="small" />
      </IconButton>,
    ],
  }
];
const [showAddDialog, setShowAddDialog] = useState(false);
 
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    status: 'active'
  });

const formatAddress = (address) => {
    if (!address) return 'No address provided';
    const { street, city, state, postalCode, country } = address;
    return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
  };

 // Fetch data with pagination and filters
 const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Fetch both customers and orders in parallel
    const [customersResponse, ordersResponse] = await Promise.all([
      customerService.getCustomers({ include: 'orders' }), // Request orders to be included
      customerService.getAllOrders()
    ]);

    // Handle API response format variations
    const customersData = Array.isArray(customersResponse) 
      ? customersResponse 
      : customersResponse?.data || customersResponse?.customers || [];
      
    const ordersData = Array.isArray(ordersResponse) 
      ? ordersResponse 
      : ordersResponse?.data || ordersResponse?.orders || [];

    console.log('Fetched customers:', customersData);
    console.log('Fetched orders:', ordersData);

    // Process customer data with their orders
    const processedCustomers = customersData.map(customer => {
      // Check if orders are included in the customer object
      const customerOrders = customer.orders || 
        ordersData.filter(order => 
          order.customerId === customer.id || 
          order.customer_id === customer.id
        );
      
      // Convert order dates to timestamps for sorting
      const sortedOrders = [...customerOrders].sort((a, b) => 
        new Date(b.orderDate || b.createdAt).getTime() - 
        new Date(a.orderDate || a.createdAt).getTime()
      );

      const totalSpent = sortedOrders.reduce(
        (sum, order) => sum + (parseFloat(order.totalAmount || order.total_amount || 0)), 
        0
      );
      
      const lastOrder = sortedOrders.length > 0 
        ? new Date(sortedOrders[0].orderDate || sortedOrders[0].createdAt)
        : null;

      return {
        ...customer,
        orders: sortedOrders,
        totalOrders: sortedOrders.length,
        totalSpent,
        lastOrder,
        avgOrderValue: sortedOrders.length > 0 
          ? totalSpent / sortedOrders.length 
          : 0,
        status: customer.status || (sortedOrders.length > 0 ? 'active' : 'inactive')
      };
    });

    // Sort customers by most recent activity
    const sortedCustomers = [...processedCustomers].sort((a, b) => {
      if (!a.lastOrder && !b.lastOrder) return 0;
      if (!a.lastOrder) return 1;
      if (!b.lastOrder) return -1;
      return b.lastOrder.getTime() - a.lastOrder.getTime();
    });

    console.log('Processed customers:', sortedCustomers);
    
    setCustomers(sortedCustomers);
    setFilteredCustomers(sortedCustomers);
    setOrders(ordersData);
    setRowCount(sortedCustomers.length);
    
  } catch (err) {
    console.error('Error in fetchData:', err);
    setError(err.response?.data?.message || err.message || 'Failed to load data');
    setCustomers([]);
    setFilteredCustomers([]);
    setOrders([]);
  } finally {
    setLoading(false);
  }
}, []);

  // Initial data fetch
  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchData();
  }, [fetchData]);

  // Apply filters and search
  useEffect(() => {
    if (!customers.length) return;

    let result = [...customers];
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(customer => 
        (customer.name?.toLowerCase().includes(searchLower)) ||
        (customer.email?.toLowerCase().includes(searchLower)) ||
        (customer.phone?.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter(customer => 
        statusFilter.includes(customer.status?.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      result.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return sort === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sort === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        return sort === 'asc' 
          ? aValue > bValue ? 1 : -1 
          : aValue < bValue ? 1 : -1;
      });
    }
    
    setFilteredCustomers(result);
    setRowCount(result.length);
  }, [customers, searchTerm, statusFilter, sortModel]);


  const handleAddCustomer = async (customerData) => {
    try {
      const newCustomer = await customerService.createCustomer({
        ...customerData,
        status: 'active'
      });
      
      setCustomers(prev => [...prev, newCustomer]);
      setShowAddDialog(false);
      setSnackbar({
        open: true,
        message: 'Customer added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add customer',
        severity: 'error'
      });
    }
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCustomer(null);
  };

  const handleExportReport = async () => {
    try {
      await reportService.exportCustomersReport('excel');
      setSnackbar({ open: true, message: 'Customer report exported successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error exporting report:', error);
      setSnackbar({ open: true, message: 'Failed to export report', severity: 'error' });
    }
  };

  // Get customer statistics
  const getCustomerStats = useCallback((customerId) => {
    const customerOrders = orders.filter(order => order.customer_id === customerId);
    const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const lastOrder = customerOrders.length > 0 
      ? new Date(Math.max(...customerOrders.map(o => new Date(o.order_date).getTime())))
      : null;
    
    return {
      totalOrders: customerOrders.length,
      totalSpent,
      lastOrder,
      avgOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0,
      status: customerOrders.length > 0 ? 'Active' : 'Inactive'
    };
  }, [orders]);

  // Handle customer selection
  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // Handle editing a customer
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      notes: customer.notes || '',
      status: customer.status || 'active'
    });
    setShowCreateForm(true);
    handleMenuClose();
  };

  // Handle deleting a customer
  const handleDeleteCustomer = async (customerId) => {
    try {
      await customerService.deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      setFilteredCustomers(prev => prev.filter(c => c.id !== customerId));
      setOrders(prev => prev.filter(o => o.customer_id !== customerId));
      setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting customer:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to delete customer', 
        severity: 'error' 
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingCustomer) {
        // Update existing customer
        const updatedCustomer = await customerService.updateCustomer(
          editingCustomer.id, 
          newCustomer
        );
        
        setCustomers(prev => 
          prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
        );
        setFilteredCustomers(prev => 
          prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
        );
        
        setSnackbar({ 
          open: true, 
          message: 'Customer updated successfully!', 
          severity: 'success' 
        });
      } else {
        // Create new customer
        const createdCustomer = await customerService.createCustomer(newCustomer);
        
        setCustomers(prev => [...prev, createdCustomer]);
        setFilteredCustomers(prev => [...prev, createdCustomer]);
        
        setSnackbar({ 
          open: true, 
          message: 'Customer created successfully!', 
          severity: 'success' 
        });
      }
      
      setShowCreateForm(false);
      setEditingCustomer(null);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        status: 'active'
      });
      
    } catch (error) {
      console.error('Error saving customer:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to save customer', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    const { value } = event.target;
    setStatusFilter(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    ); 
    setPage(0); // Reset to first page when filtering
  };

  // Handle sort model change
  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
  };

  // Handle row selection
  const handleSelectionModelChange = (newSelection) => {
    setSelectedRows(newSelection);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchData();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setSortModel([{ field: 'name', sort: 'asc' }]);
    setPage(0);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter.length > 0 || 
    (sortModel.length > 0 && sortModel[0].field !== 'name');

  // Calculate paginated data
  const paginatedCustomers = filteredCustomers.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  // Customer card component for grid view
  const CustomerCard = ({ customer }) => {
    const stats = getCustomerStats(customer.id);
    
    return (
      <Card 
        sx={{ 
          height: '100%', 
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onClick={() => handleCustomerClick(customer)}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                {customer.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" component="h3" noWrap>
                  {customer.name}
                </Typography>
                <Chip 
                  label={customer.status || 'inactive'} 
                  size="small" 
                  color={stats.status === 'Active' ? 'success' : 'default'}
                />
              </Box>
            </Box>
            <IconButton 
              size="small"
              onClick={(e) => handleMenuClick(e, customer)}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Box mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {customer.email}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {customer.phone}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {stats.totalOrders}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Orders
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main">
                  ${stats.totalSpent.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Spent
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const CustomerDetailsDialog = () => {
    if (!selectedCustomer) return null;

    const stats = getCustomerStats(selectedCustomer.id);
    const customerOrders = orders.filter(order => order.customer_id === selectedCustomer.id);

    return (
      <Dialog 
        open={showCustomerDetails} 
        onClose={() => setShowCustomerDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5">{selectedCustomer.name}</Typography>
                <Chip 
                  label={stats.status} 
                  color={stats.status === 'Active' ? 'success' : 'default'}
                />
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => {
                handleEditCustomer(selectedCustomer);
                setShowCustomerDetails(false);
              }}
            >
              Edit
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Overview" />
            <Tab label="Order History" />
          </Tabs>

          {tabValue === 0 && (
            <Box mt={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Contact Information</Typography>
                      <Box mb={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Email sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography>{selectedCustomer.email}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography>{selectedCustomer.phone}</Typography>
                        </Box>
                        {selectedCustomer && selectedCustomer.address && (
                          <Box display="flex" alignItems="center">
                            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography>{formatAddress(selectedCustomer.address)}</Typography>
                          </Box>
                        )}
                      </Box>
                      {selectedCustomer.notes && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedCustomer.notes}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Customer Statistics</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4">{stats.totalOrders}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4">${stats.totalSpent.toFixed(0)}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Spent</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h5">${stats.avgOrderValue.toFixed(2)}</Typography>
                            <Typography variant="body2" color="text.secondary">Avg Order Value</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h6">
                              {stats.lastOrder ? stats.lastOrder.toLocaleDateString() : 'Never'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Last Order</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 1 && (
            <Box mt={3}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            size="small"
                            color={order.status === 'delivered' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">${order.total_amount?.toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowCustomerDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 3 }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={5}>
            <Typography variant="h2" component="h1" sx={{ color: 'white', fontWeight: 800, mb: 2 }}>
              Customer Management
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Manage customers and track their activity
            </Typography>
          </Box>

          <Box display="flex" justifyContent="center" gap={2} mb={4}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setShowAddDialog(true)}
            startIcon={<AddIcon />}
          >
            Add Customer
          </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportReport}
              sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
            >
              Export Report
            </Button>
          </Box>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Customers ({customers.length})
              </Typography>
              {customers.map(customer => (
              <Grid item xs={12} sm={6} md={4} key={customer.id}>
            <CustomerDetailCard
              customer={customer}
              orders={customer.orders || []}
              totalSpentProp={customer.totalSpent || 0}
              totalOrdersProp={customer.totalOrders || 0}
              avgOrderValueProp={customer.avgOrderValue || 0}
              lastOrderDate={customer.lastOrder}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              onViewOrders={handleViewCustomerOrders}
            />
            </Grid>
            ))}
            </CardContent>
          </Card>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleEditCustomer(menuCustomer)}>
              <Edit sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={() => handleDeleteCustomer(menuCustomer?.id)}>
              <Delete sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>

          <CustomerDetailsDialog />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
