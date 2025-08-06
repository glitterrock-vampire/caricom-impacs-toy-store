import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Alert, CircularProgress, Card, CardContent,
  Chip, Avatar, IconButton, Menu, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Grid,
  TextField, FormControl, InputLabel, Select, MenuItem as SelectMenuItem,
  Pagination, Tabs, Tab, OutlinedInput, Checkbox, ListItemText, ListItemIcon
} from '@mui/material';
import {
  Add, MoreVert, Email, Phone, LocationOn, ShoppingCart,
  TrendingUp, Visibility, Edit, Delete, Download, Search
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '../theme/muiTheme';
import { customerService } from '../services/customerService';
import { reportService } from '../services/reportService';
import { format, parseISO, isValid } from 'date-fns';
// CustomerDetailCard component is not used in this file
import debounce from 'lodash/debounce';

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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  // Initialize customer stats with default values
  const [customerStats, setCustomerStats] = useState(() => ({
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    lastOrderDate: null
  }));
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
  const navigate = useNavigate();

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    status: 'active'
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setSearchTerm(value);
      setPage(0);
    }, 300),
    []
  );

  const calculateCustomerStats = useCallback((orders) => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        avgOrderValue: 0,
        lastOrderDate: null
      };
    }

    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Find the most recent order date
    const lastOrderDate = orders.length > 0 
      ? new Date(Math.max(...orders.map(o => new Date(o.orderDate))))
      : null;

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      lastOrderDate: lastOrderDate && isValid(lastOrderDate) ? lastOrderDate : null
    };
  }, []);

  const handleViewCustomerOrders = useCallback(async (customer) => {
    try {
      setIsLoadingOrders(true);
      // Fetch orders for this specific customer
      const orders = await customerService.getCustomerOrders(customer.id);
      setCustomerOrders(orders);
      
      // Calculate and update customer statistics
      const stats = calculateCustomerStats(orders);
      setCustomerStats(stats);
      
      setShowOrdersModal(true);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load customer orders',
        severity: 'error'
      });
    } finally {
      setIsLoadingOrders(false);
    }
  }, [calculateCustomerStats]);

  const enhanceCustomerWithOrders = useCallback(async (customer) => {
    try {
      // If customer already has orders and stats, no need to fetch again
      if (customer.orders && customer.orders.length > 0 && customer.stats) {
        return customer;
      }
      
      // Otherwise fetch the full customer data with orders
      const fullCustomer = await customerService.getCustomerById(customer.id);
      
      // Calculate statistics if not already present
      if (fullCustomer.orders && !fullCustomer.stats) {
        fullCustomer.stats = calculateCustomerStats(fullCustomer.orders);
      }
      
      return fullCustomer;
    } catch (error) {
      console.error('Error enhancing customer with orders:', error);
      return customer; // Return original customer if there's an error
    }
  }, [calculateCustomerStats]);

  const handleViewCustomer = useCallback(async (customer) => {
    try {
      setLoading(true);
      const fullCustomer = await enhanceCustomerWithOrders(customer);
      
      // Calculate stats from the customer's orders
      const stats = fullCustomer.stats || calculateCustomerStats(fullCustomer.orders || []);
      
      // Update the customer in the main list with the enhanced data
      const updatedCustomer = {
        ...fullCustomer,
        totalSpent: stats.totalSpent,
        totalOrders: stats.totalOrders,
        avgOrderValue: stats.avgOrderValue,
        lastOrderDate: stats.lastOrderDate,
        stats // Include the stats object for future reference
      };
      
      setCustomers(prevCustomers => 
        prevCustomers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
      );
      
      setSelectedCustomer(updatedCustomer);
      setCustomerOrders(updatedCustomer.orders || []);
      setCustomerStats(stats);
      setShowCustomerDetails(true);
    } catch (error) {
      console.error('Error viewing customer:', error);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  }, [enhanceCustomerWithOrders, calculateCustomerStats]);

  const handleMenuClick = useCallback((event, customer) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuCustomer(customer);
  }, []);

  const formatAddress = useCallback((address) => {
    if (!address) return 'No address provided';
    const { street, city, state, postalCode, country } = address;
    return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [customersResponse, ordersResponse] = await Promise.all([
        customerService.getCustomers({ include: 'orders' }),
        customerService.getAllOrders()
      ]);

      const customersData = Array.isArray(customersResponse)
        ? customersResponse
        : customersResponse?.data || customersResponse?.customers || [];

      const ordersData = Array.isArray(ordersResponse)
        ? ordersResponse
        : ordersResponse?.data || ordersResponse?.orders || [];

      const processedCustomers = customersData.map(customer => {
        const customerOrders = customer.orders ||
          ordersData.filter(order =>
            order.customerId === customer.id || order.customer_id === customer.id
          );

        const sortedOrders = [...customerOrders].sort((a, b) =>
          new Date(b.orderDate || b.order_date || b.createdAt).getTime() -
          new Date(a.orderDate || a.order_date || a.createdAt).getTime()
        );

        const totalSpent = sortedOrders.reduce(
          (sum, order) => sum + (parseFloat(order.totalAmount || order.total_amount || 0)),
          0
        );

        const lastOrder = sortedOrders.length > 0
          ? new Date(sortedOrders[0].orderDate || sortedOrders[0].order_date || sortedOrders[0].createdAt)
          : null;

        return {
          ...customer,
          orders: sortedOrders,
          totalOrders: sortedOrders.length,
          totalSpent,
          lastOrder,
          lastOrderDate: lastOrder,
          avgOrderValue: sortedOrders.length > 0 ? totalSpent / sortedOrders.length : 0,
          status: customer.status || (sortedOrders.length > 0 ? 'active' : 'inactive')
        };
      });

      const sortedCustomers = [...processedCustomers].sort((a, b) => {
        if (!a.lastOrder && !b.lastOrder) return 0;
        if (!a.lastOrder) return 1;
        if (!b.lastOrder) return -1;
        return b.lastOrder.getTime() - a.lastOrder.getTime();
      });

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!customers.length) return;

    let result = [...customers];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(customer =>
        (customer.name?.toLowerCase().includes(searchLower)) ||
        (customer.email?.toLowerCase().includes(searchLower)) ||
        (customer.phone?.toLowerCase().includes(searchLower))
      );
    }

    if (statusFilter.length > 0) {
      result = result.filter(customer =>
        statusFilter.includes(customer.status?.toLowerCase())
      );
    }

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

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setMenuCustomer(null);
  }, []);

  const handleExportReport = useCallback(async () => {
    try {
      await reportService.exportCustomersReport('excel');
      setSnackbar({ open: true, message: 'Customer report exported successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error exporting report:', error);
      setSnackbar({ open: true, message: 'Failed to export report', severity: 'error' });
    }
  }, []);

  const safeFormatDate = useCallback((dateString, formatString = 'MMM d, yyyy') => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return isValid(date) ? format(date, formatString) : 'N/A';
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'N/A';
    }
  }, []);

  const getCustomerStats = useCallback((customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        lastOrder: null,
        lastOrderDate: null,
        avgOrderValue: 0,
        status: 'Inactive'
      };
    }

    // If we already have calculated stats, use them
    if (customer.stats) {
      return {
        totalOrders: customer.stats.totalOrders || 0,
        totalSpent: customer.stats.totalSpent || 0,
        lastOrder: customer.orders && customer.orders.length > 0 ? customer.orders[0] : null,
        lastOrderDate: customer.stats.lastOrderDate || null,
        avgOrderValue: customer.stats.avgOrderValue || 0,
        status: customer.status || 'Inactive'
      };
    }

    // Otherwise calculate from orders
    const customerOrders = customer.orders ||
      orders.filter(order =>
        order.customer_id === customerId || order.customerId === customerId
      );

    const totalSpent = customerOrders.reduce((sum, order) => {
      const amount = parseFloat(order.total_amount || order.totalAmount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    let lastOrder = null;
    let lastOrderDate = null;

    if (customerOrders.length > 0) {
      const sortedOrders = [...customerOrders].sort((a, b) => {
        const dateA = new Date(a.order_date || a.orderDate || a.createdAt).getTime();
        const dateB = new Date(b.order_date || b.orderDate || b.createdAt).getTime();
        return dateB - dateA;
      });

      lastOrder = sortedOrders[0];
      lastOrderDate = new Date(lastOrder.order_date || lastOrder.orderDate || lastOrder.createdAt);
    }

    const avgOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
    const status = customer.status || (customerOrders.length > 0 ? 'Active' : 'Inactive');

    // Cache the calculated stats on the customer object
    if (customer) {
      customer.stats = {
        totalOrders: customerOrders.length,
        totalSpent,
        avgOrderValue,
        lastOrderDate
      };
    }

    return {
      totalOrders: customerOrders.length,
      totalSpent,
      lastOrder,
      lastOrderDate,
      avgOrderValue,
      status
    };
  }, [customers, orders]);

  const handleEditCustomer = useCallback((customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || '',
      status: customer.status || 'active'
    });
    setShowAddDialog(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleDeleteCustomer = useCallback(async (customerId) => {
    try {
      await customerService.deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      setFilteredCustomers(prev => prev.filter(c => c.id !== customerId));
      setOrders(prev => prev.filter(o => o.customer_id !== customerId && o.customerId !== customerId));
      setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
      handleMenuClose();
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete customer',
        severity: 'error'
      });
    }
  }, [handleMenuClose]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));

    // Validate input
    setFormErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'email':
        return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format';
      case 'phone':
        return value && !/^\+?[\d\s-]{8,}$/.test(value) ? 'Invalid phone format' : '';
      default:
        return '';
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errors = {
      name: validateField('name', newCustomer.name),
      email: validateField('email', newCustomer.email),
      phone: validateField('phone', newCustomer.phone)
    };

    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      setSnackbar({
        open: true,
        message: 'Please fix the form errors before submitting',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);

      if (editingCustomer) {
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
        const createdCustomer = await customerService.createCustomer(newCustomer);
        setCustomers(prev => [...prev, createdCustomer]);
        setFilteredCustomers(prev => [...prev, createdCustomer]);
        setSnackbar({
          open: true,
          message: 'Customer created successfully!',
          severity: 'success'
        });
      }

      setShowAddDialog(false);
      setEditingCustomer(null);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        status: 'active'
      });
      setFormErrors({ name: '', email: '', phone: '' });
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
  }, [editingCustomer, newCustomer]);

  const handleSearchChange = useCallback((e) => {
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  const handleStatusFilterChange = useCallback((event) => {
    const { value } = event.target;
    setStatusFilter(typeof value === 'string' ? value.split(',') : value);
    setPage(0);
  }, []);

  // Sorting is handled in the useEffect that watches sortModel
  const handleSortModelChange = useCallback((newSortModel) => {
    setSortModel(newSortModel);
  }, []);

  const handlePageChange = useCallback((event, value) => {
    setPage(value - 1);
  }, []);

  const handlePageSizeChange = useCallback((event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  }, []);
  
  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter([]);
    setSortModel([{ field: 'name', sort: 'asc' }]);
    setPage(0);
  }, []);

  const hasActiveFilters = searchTerm || statusFilter.length > 0 ||
    (sortModel.length > 0 && sortModel[0].field !== 'name');

  const paginatedCustomers = useMemo(() =>
    filteredCustomers.slice(page * pageSize, (page + 1) * pageSize),
    [filteredCustomers, page, pageSize]
  );

  const CustomerDetailsDialog = () => {
    if (!selectedCustomer) return null;

    const stats = getCustomerStats(selectedCustomer.id);
    const customerOrders = selectedCustomer.orders ||
      orders.filter(order =>
        order.customerId === selectedCustomer.id || order.customer_id === selectedCustomer.id
      );

    return (
      <Dialog
        open={showCustomerDetails}
        onClose={() => setShowCustomerDetails(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="customer-details-dialog-title"
      >
        <DialogTitle id="customer-details-dialog-title">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                {selectedCustomer.name?.charAt(0).toUpperCase()}
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
              aria-label={`Edit customer ${selectedCustomer.name}`}
            >
              Edit
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="Customer details tabs">
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
                          <Typography>{selectedCustomer.email || 'N/A'}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography>{selectedCustomer.phone || 'N/A'}</Typography>
                        </Box>
                        {selectedCustomer.address && (
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
                            <Typography variant="h4">{customerStats.totalOrders || 0}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4">${(customerStats.totalSpent || 0).toFixed(0)}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Spent</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h5">${(customerStats.avgOrderValue || 0).toFixed(2)}</Typography>
                            <Typography variant="body2" color="text.secondary">Avg Order Value</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h6">
                              {customerStats.lastOrderDate ? safeFormatDate(customerStats.lastOrderDate) : 'Never'}
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
              {customerOrders.length === 0 ? (
                <Typography variant="body1" align="center" color="text.secondary">
                  No orders found for this customer.
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table aria-label="Order history table">
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
                          <TableCell>{safeFormatDate(order.order_date || order.orderDate)}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              size="small"
                              color={order.status === 'delivered' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">${(order.total_amount || order.totalAmount || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowCustomerDetails(false)} aria-label="Close customer details">
            Close
          </Button>
          <Button
            onClick={() => handleViewCustomerOrders(selectedCustomer)}
            startIcon={<ShoppingCart />}
            variant="outlined"
            color="primary"
            aria-label={`View all orders for ${selectedCustomer.name}`}
            sx={{ minWidth: '180px' }}
          >
            View All Orders
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const AddCustomerDialog = () => (
    <Dialog
      open={showAddDialog}
      onClose={() => {
        setShowAddDialog(false);
        setEditingCustomer(null);
        setNewCustomer({
          name: '',
          email: '',
          phone: '',
          address: '',
          notes: '',
          status: 'active'
        });
        setFormErrors({ name: '', email: '', phone: '' });
      }}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-customer-dialog-title"
    >
      <DialogTitle id="add-customer-dialog-title">
        {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              name="name"
              label="Full Name"
              value={newCustomer.name}
              onChange={handleInputChange}
              required
              fullWidth
              error={!!formErrors.name}
              helperText={formErrors.name}
              inputProps={{ 'aria-required': true }}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={newCustomer.email}
              onChange={handleInputChange}
              required
              fullWidth
              error={!!formErrors.email}
              helperText={formErrors.email}
              inputProps={{ 'aria-required': true }}
            />
            <TextField
              name="phone"
              label="Phone Number"
              value={newCustomer.phone}
              onChange={handleInputChange}
              fullWidth
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
            <TextField
              name="address"
              label="Address"
              value={newCustomer.address}
              onChange={handleInputChange}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              name="notes"
              label="Notes"
              value={newCustomer.notes}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={newCustomer.status}
                onChange={handleInputChange}
                label="Status"
                required
                aria-required="true"
              >
                {statusOptions.map((option) => (
                  <SelectMenuItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectMenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddDialog(false);
              setEditingCustomer(null);
              setNewCustomer({
                name: '',
                email: '',
                phone: '',
                address: '',
                notes: '',
                status: 'active'
              });
              setFormErrors({ name: '', email: '', phone: '' });
            }}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || Object.values(formErrors).some(error => error) || !newCustomer.name || !newCustomer.email}
            aria-label={editingCustomer ? 'Update customer' : 'Add customer'}
          >
            {loading ? <CircularProgress size={24} /> : (editingCustomer ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  const DeleteConfirmDialog = () => (
    <Dialog
      open={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      aria-labelledby="delete-confirm-dialog-title"
    >
      <DialogTitle id="delete-confirm-dialog-title">Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete {customerToDelete?.name || 'this customer'}? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDeleteConfirm(false)} aria-label="Cancel delete">
          Cancel
        </Button>
        <Button
          onClick={() => handleDeleteCustomer(customerToDelete?.id)}
          color="error"
          variant="contained"
          aria-label="Confirm delete"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" id="customer-management-title">
            Customer Management
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportReport}
              aria-label="Export customer report"
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => {
                setNewCustomer({
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  notes: '',
                  status: 'active'
                });
                setEditingCustomer(null);
                setFormErrors({ name: '', email: '', phone: '' });
                setShowAddDialog(true);
              }}
              aria-label="Add new customer"
            >
              Add Customer
            </Button>
          </Box>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <Search />
                      </Box>
                    ),
                  }}
                  aria-label="Search customers"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-filter-label">Status Filter</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    multiple
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    input={<OutlinedInput label="Status Filter" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={statusOptions.find(o => o.value === value)?.label || value}
                          />
                        ))}
                      </Box>
                    )}
                    aria-label="Filter by status"
                  >
                    {statusOptions.map((option) => (
                      <SelectMenuItem key={option.value} value={option.value}>
                        <Checkbox checked={statusFilter.includes(option.value)} />
                        <ListItemText primary={option.label} />
                      </SelectMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                  aria-label="Clear filters"
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress aria-label="Loading customers" />
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button color="inherit" size="small" onClick={handleRefresh} aria-label="Retry loading">
              Retry
            </Button>
          </Alert>
        )}

        {!loading && !error && filteredCustomers.length === 0 && (
          <Box textAlign="center" py={6}>
            <img
              src="/images/empty-customers.svg"
              alt="No customers found"
              style={{ height: 200, marginBottom: 16 }}
            />
            <Typography variant="h6" gutterBottom>
              {hasActiveFilters ? 'No matching customers found' : 'No customers yet'}
            </Typography>
            <Typography color="textSecondary" paragraph>
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first customer'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setShowAddDialog(true)}
              aria-label="Add first customer"
            >
              Add Customer
            </Button>
          </Box>
        )}

        {!loading && !error && filteredCustomers.length > 0 && (
          <>
            <TableContainer component={Paper}>
              <Table aria-label="Customer list table">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell align="center">Orders</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                    <TableCell>Last Order</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      hover
                      sx={{ '&:hover': { cursor: 'pointer' } }}
                      onClick={() => handleViewCustomer(customer)}
                      aria-label={`View details for ${customer.name}`}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {customer.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" noWrap>{customer.name}</Typography>
                            <Typography variant="body2" color="textSecondary" noWrap>
                              {customer.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography>{customer.phone || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography>{customer.totalOrders}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography>${customer.totalSpent?.toFixed(2) || '0.00'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {safeFormatDate(customer.lastOrderDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={customer.status}
                          color={
                            customer.status === 'active' ? 'success' :
                            customer.status === 'vip' ? 'warning' :
                            customer.status === 'new' ? 'info' : 'default'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, customer);
                          }}
                          aria-label={`More actions for ${customer.name}`}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="rows-per-page-label">Rows per page</InputLabel>
                <Select
                  labelId="rows-per-page-label"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  label="Rows per page"
                  aria-label="Select rows per page"
                >
                  {[5, 10, 25, 50].map((size) => (
                    <SelectMenuItem key={size} value={size}>{size}</SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
              <Pagination
                count={Math.ceil(rowCount / pageSize)}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                aria-label="Customer list pagination"
              />
            </Box>
          </>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          aria-label="Customer actions menu"
        >
          <MenuItem
            onClick={() => {
              handleViewCustomer(menuCustomer);
              handleMenuClose();
            }}
          >
            <Visibility sx={{ mr: 1 }} /> View Details
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleEditCustomer(menuCustomer);
              handleMenuClose();
            }}
          >
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleViewCustomerOrders(menuCustomer.id);
              handleMenuClose();
            }}
          >
            <ShoppingCart sx={{ mr: 1 }} /> View Orders
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setCustomerToDelete(menuCustomer);
              setShowDeleteConfirm(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1, color: 'error.main' }} /> Delete
          </MenuItem>
        </Menu>

        <CustomerDetailsDialog />
        <AddCustomerDialog />
        <DeleteConfirmDialog />

        {/* Customer Orders Modal */}
        <Dialog
          open={showOrdersModal}
          onClose={() => setShowOrdersModal(false)}
          maxWidth="md"
          fullWidth
          aria-labelledby="customer-orders-dialog-title"
        >
          <DialogTitle id="customer-orders-dialog-title">
            Order History for {selectedCustomer?.name}
          </DialogTitle>
          <DialogContent>
            {isLoadingOrders ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : customerOrders.length === 0 ? (
              <Box textAlign="center" p={4}>
                <Typography variant="body1" color="textSecondary">
                  No orders found for this customer.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table aria-label="customer orders table">
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
                        <TableCell>
                          {order.orderDate ? format(new Date(order.orderDate), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status || 'N/A'}
                            size="small"
                            color={
                              order.status === 'completed' ? 'success' :
                              order.status === 'pending' ? 'warning' : 'default'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          ${(order.totalAmount || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowOrdersModal(false)}
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}