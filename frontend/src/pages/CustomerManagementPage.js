import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Alert, CircularProgress, Card, CardContent,
  Chip, Avatar, IconButton, Menu, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Grid,
  TextField, FormControl, InputLabel, Select, MenuItem as SelectMenuItem,
  Pagination, Tooltip
} from '@mui/material';
import {
  Add, MoreVert, Email, Phone, ShoppingCart,
  Visibility, Edit, Delete, Download, Search,
  LocationOn
} from '@mui/icons-material';
import { customerService } from '../services/customerService';
import { format, parseISO, isValid } from 'date-fns';
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
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCustomer, setMenuCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    notes: '',
    status: 'active'
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setSearchTerm(value);
      setPage(0);
    }, 300),
    []
  );

  // Safe date formatter
  // Format address from object or string
  const formatAddress = useCallback((addressObj) => {
    if (!addressObj) return 'N/A';
    
    // If it's a string, return it directly
    if (typeof addressObj === 'string') {
      return addressObj;
    }
    
    // If it's an object, format the address parts
    if (typeof addressObj === 'object') {
      const { street, city, state, postalCode, postal_code, country } = addressObj;
      const parts = [
        street,
        city,
        state,
        postalCode || postal_code,
        country && country !== 'USA' ? country : null
      ].filter(Boolean);
      
      return parts.join(', ');
    }
    
    return 'N/A';
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

  // Safe currency formatter
  const formatCurrency = useCallback((amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    const num = parseFloat(amount);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  }, []);

  // Fetch customers data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching customers...');
      const customersData = await customerService.getCustomers();
      console.log('Received customers data:', customersData);

      // The customerService now returns enhanced customers with calculated stats
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err.message || 'Failed to load customers');
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and search customers
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

    // Sort by most recent order date, then by name
    result.sort((a, b) => {
      if (!a.lastOrderDate && !b.lastOrderDate) {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (!a.lastOrderDate) return 1;
      if (!b.lastOrderDate) return -1;
      
      const dateA = new Date(a.lastOrderDate);
      const dateB = new Date(b.lastOrderDate);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredCustomers(result);
  }, [customers, searchTerm, statusFilter]);

  const handleMenuClick = useCallback((event, customer) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuCustomer(customer);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setMenuCustomer(null);
  }, []);

  const handleViewCustomer = useCallback(async (customer) => {
    try {
      setLoading(true);
      // Get full customer details with orders
      const fullCustomer = await customerService.getCustomerById(customer.id);
      setSelectedCustomer(fullCustomer);
      setShowCustomerDetails(true);
    } catch (error) {
      console.error('Error viewing customer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load customer details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditCustomer = useCallback((customer) => {
    setEditingCustomer(customer);
    
    // Handle case where address might be an object
    const addressData = typeof customer.address === 'object' ? customer.address : {
      street: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      postalCode: customer.postalCode || '',
      country: customer.country || 'USA'
    };

    setNewCustomer({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: addressData.street || '',
      city: addressData.city || '',
      state: addressData.state || '',
      postalCode: addressData.postalCode || addressData.postal_code || '',
      country: addressData.country || 'USA',
      notes: customer.notes || '',
      status: customer.status || 'active'
    });
    setShowAddDialog(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleDeleteCustomer = useCallback(async (customerId) => {
    try {
      await customerService.deleteCustomer(customerId);
      
      // Remove from local state
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      setFilteredCustomers(prev => prev.filter(c => c.id !== customerId));
      
      setSnackbar({ 
        open: true, 
        message: 'Customer deleted successfully!', 
        severity: 'success' 
      });
      
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting customer:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete customer',
        severity: 'error'
      });
    }
  }, [handleMenuClose]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'email':
        return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format';
      case 'phone':
        return value && !/^\+?[\d\s-]{8,}$/.test(value) ? 'Invalid phone format' : '';
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
};

// Handle address field changes
const handleAddressChange = (field, value) => {
  setNewCustomer(prev => ({
    ...prev,
    [field]: value
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  const errors = {};
  if (!newCustomer.name.trim()) errors.name = 'Name is required';
  if (!newCustomer.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(newCustomer.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  try {
    setLoading(true);
    
    // Prepare customer data with address as an object
    const customerData = {
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone || null,
      address: {
        street: newCustomer.address || '',
        city: newCustomer.city || '',
        state: newCustomer.state || '',
        postalCode: newCustomer.postalCode || '',
        country: newCustomer.country || 'USA'
      },
      notes: newCustomer.notes || null,
      status: newCustomer.status || 'active'
    };

    if (editingCustomer) {
      await customerService.updateCustomer(editingCustomer.id, customerData);
      setSnackbar({
        open: true,
        message: 'Customer updated successfully',
        severity: 'success'
      });
    } else {
      // For new customers, generate a random password (should be changed by user)
      await customerService.createCustomer({
        ...customerData,
        password: Math.random().toString(36).slice(-8), // Random password
      });
      setSnackbar({
        open: true,
        message: 'Customer added successfully',
        severity: 'success'
      });
    }
    
    // Reset form and close dialog
    setShowAddDialog(false);
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      notes: '',
      status: 'active'
    });
    
    // Refresh customer list
    fetchData();
  } catch (error) {
    console.error('Error saving customer:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.message || 'Failed to save customer',
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};

const handleSearchChange = useCallback((e) => {
  debouncedSearch(e.target.value);
}, [debouncedSearch]);

const handleStatusFilterChange = useCallback((event) => {
  const { value } = event.target;
  setStatusFilter(typeof value === 'string' ? value.split(',') : value);
  setPage(0);
}, []);

  const handlePageChange = useCallback((event, value) => {
    setPage(value - 1);
  }, []);

  // Calculate paginated customers
  const paginatedCustomers = useMemo(() =>
    filteredCustomers.slice(page * pageSize, (page + 1) * pageSize),
    [filteredCustomers, page, pageSize]
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Customer Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => {
              setSnackbar({
                open: true,
                message: 'Export functionality coming soon',
                severity: 'info'
              });
            }}
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
          >
            Add Customer
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search customers by name, email, or phone..."
                defaultValue={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Search />
                    </Box>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  multiple
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status Filter"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={statusOptions.find(o => o.value === value)?.label || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {statusOptions.map((option) => (
                    <SelectMenuItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button color="inherit" size="small" onClick={fetchData}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCustomers.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" gutterBottom>
            {searchTerm || statusFilter.length > 0 ? 'No matching customers found' : 'No customers yet'}
          </Typography>
          <Typography color="textSecondary" paragraph>
            {searchTerm || statusFilter.length > 0
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first customer'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setShowAddDialog(true)}
          >
            Add Customer
          </Button>
        </Box>
      )}

      {/* Customer Table */}
      {!loading && !error && filteredCustomers.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
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
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {customer.name?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" noWrap>
                            {customer.name || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" noWrap>
                            {customer.email || 'No email'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography>{customer.phone || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold">
                        {customer.totalOrders || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="success.main">
                        {formatCurrency(customer.totalSpent)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {safeFormatDate(customer.lastOrderDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status || 'inactive'}
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
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
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
            setCustomerToDelete(menuCustomer);
            setShowDeleteConfirm(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1, color: 'error.main' }} /> Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Customer Dialog */}
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
      >
        <DialogTitle>
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
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="address"
                    label="Street Address"
                    value={newCustomer.address}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="city"
                    label="City"
                    value={newCustomer.city}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="state"
                    label="State/Province"
                    value={newCustomer.state}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="postalCode"
                    label="Postal Code"
                    value={newCustomer.postalCode}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="country"
                    label="Country"
                    value={newCustomer.country}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
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
                  city: '',
                  state: '',
                  postalCode: '',
                  country: 'USA',
                  notes: '',
                  status: 'active'
                });
                setFormErrors({ name: '', email: '', phone: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || Object.values(formErrors).some(error => error) || !newCustomer.name || !newCustomer.email}
            >
              {loading ? <CircularProgress size={24} /> : (editingCustomer ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog
        open={showCustomerDetails}
        onClose={() => setShowCustomerDetails(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCustomer && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">{selectedCustomer.name}</Typography>
                    <Chip
                      label={selectedCustomer.status || 'inactive'}
                      color={selectedCustomer.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  <Tooltip title="Edit customer details">
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
                  </Tooltip>
                  <Tooltip title="View full customer profile with order history">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        navigate(`/customers/${selectedCustomer.id}`);
                        setShowCustomerDetails(false);
                      }}
                    >
                      View Full Details
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Contact Information</Typography>
                      <Box mb={2}>
                        <Box display="flex" alignItems="flex-start" mb={1}>
                          <Email sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                          <Box>
                            <Typography>{selectedCustomer.email || 'N/A'}</Typography>
                            <Typography variant="caption" color="text.secondary">Email</Typography>
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="flex-start" mb={1}>
                          <Phone sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                          <Box>
                            <Typography>{selectedCustomer.phone || 'N/A'}</Typography>
                            <Typography variant="caption" color="text.secondary">Phone</Typography>
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="flex-start" mb={1}>
                          <LocationOn sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                          <Box>
                            <Typography>
                              {formatAddress(selectedCustomer.address)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Address
                            </Typography>
                          </Box>
                        </Box>
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
                      <Typography variant="h6" gutterBottom>Order Statistics</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4">{selectedCustomer.totalOrders || 0}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h4" color="success.main">
                              {formatCurrency(selectedCustomer.totalSpent)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Total Spent</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h5">
                              {formatCurrency(selectedCustomer.avgOrderValue)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Avg Order Value</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h6">
                              {safeFormatDate(selectedCustomer.lastOrderDate)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Last Order</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recent Orders */}
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Recent Orders</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedCustomer.orders.slice(0, 5).map((order) => (
                                <TableRow key={order.id}>
                                  <TableCell>#{order.id}</TableCell>
                                  <TableCell>
                                    {safeFormatDate(order.orderDate || order.order_date)}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={order.status || 'unknown'}
                                      size="small"
                                      color={order.status === 'delivered' ? 'success' : 'default'}
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatCurrency(order.totalAmount || order.total_amount)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        {selectedCustomer.orders.length > 5 && (
                          <Box mt={2} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                              Showing 5 of {selectedCustomer.orders.length} orders
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setShowCustomerDetails(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {customerToDelete?.name || 'this customer'}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteCustomer(customerToDelete?.id)}
            color="error"
            variant="contained"
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
  );
}