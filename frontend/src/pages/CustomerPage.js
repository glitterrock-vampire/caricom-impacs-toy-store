import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Avatar, 
  Chip, 
  CircularProgress,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  ArrowBack, 
  Email, 
  Phone, 
  LocationOn, 
  ShoppingCart, 
  AttachMoney,
  CalendarToday,
  Edit,
  Delete,
  LocationCity,
  LocalPostOffice,
  Public,
  Home,
  Info
} from '@mui/icons-material';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Safe date formatter
const safeFormatDate = (dateString, formatString = 'MMM d, yyyy') => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date && !isNaN(date) ? new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date) : 'N/A';
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'N/A';
  }
};

// Safe currency formatter
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  const num = parseFloat(amount);
  return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
};

const CustomerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);

  const fetchCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching customer data for ID:', id);
      // Get customer with orders and calculated stats
      const customerData = await customerService.getCustomerById(id);
      console.log('Received customer data:', customerData);
      
      setCustomer(customerData);
    } catch (err) {
      console.error('Error in fetchCustomerData:', err);
      setError(err.message || 'Failed to load customer details. Please try again later.');
      setSnackbar({
        open: true,
        message: 'Failed to load customer data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id, fetchCustomerData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && !customer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/customers')}
          sx={{ mt: 2 }}
        >
          Back to Customers
        </Button>
      </Container>
    );
  }

  if (!customer) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Customer not found</Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The requested customer could not be found or may have been removed.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/customers')}
          sx={{ mt: 2 }}
        >
          Back to Customers
        </Button>
      </Container>
    );
  }

  const { 
    name, 
    email, 
    phone, 
    address: addressObj, // Address might be an object
    city: cityProp, 
    state: stateProp, 
    postalCode: postalCodeProp, 
    country: countryProp,
    createdAt,
    totalOrders = 0,
    totalSpent = 0,
    avgOrderValue = 0,
    lastOrderDate,
    orders = []
  } = customer;

  // Helper to safely get address fields from various possible structures
  const getAddressField = (field) => {
    // If address is a string, return it only for street field
    if (typeof addressObj === 'string') {
      return field === 'street' ? addressObj : '';
    }
    
    // If address is an object, try to get the field
    if (addressObj && typeof addressObj === 'object') {
      // Handle different field name variations
      if (field === 'postalCode' && addressObj['postal_code']) {
        return addressObj['postal_code'];
      }
      return addressObj[field] || '';
    }
    
    // Fallback to individual props if addressObj is not usable
    const fieldMap = {
      street: addressObj || '',
      city: cityProp || '',
      state: stateProp || '',
      postalCode: postalCodeProp || '',
      country: countryProp || 'USA'
    };
    
    return fieldMap[field] || '';
  };

  // Get address components with safe defaults
  const address = String(getAddressField('street') || '');
  const city = String(getAddressField('city') || '');
  const state = String(getAddressField('state') || '');
  const postalCode = String(getAddressField('postalCode') || getAddressField('postal_code') || '');
  const country = String(getAddressField('country') || 'USA');
  
  // Format the full address as a string
  const formatAddress = () => {
    const parts = [
      address,
      city,
      state,
      postalCode,
      country && country !== 'USA' ? country : null
    ].filter(Boolean);
    
    return parts.join(', ');
  };
  
  const formattedAddress = formatAddress();
    
  const customerSince = safeFormatDate(createdAt, 'MMMM d, yyyy');
  const lastOrder = safeFormatDate(lastOrderDate);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Grid container spacing={3} display="grid" gridTemplateColumns="repeat(12, 1fr)">
        {/* Customer Profile Card */}
        <Grid item xs={12} md={4} gridColumn={{ xs: 'span 12', md: 'span 4' }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  fontSize: 36,
                  mb: 2,
                  bgcolor: 'primary.main',
                  color: 'white'
                }}
              >
                {getInitials(name)}
              </Avatar>
              <Typography variant="h5" component="h1" align="center">
                {name}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Customer since {customerSince}
              </Typography>
              <Box mt={2} display="flex" gap={1}>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Edit fontSize="small" />}
                  onClick={() => navigate(`/customers/${id}/edit`)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  color="error"
                  startIcon={<Delete fontSize="small" />}
                  onClick={() => {/* Handle delete */}}
                >
                  Delete
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List>
              <ListItem>
                <Email color="action" sx={{ mr: 1 }} />
                <ListItemText 
                  primary={email || 'N/A'} 
                  secondary="Email"
                  primaryTypographyProps={{
                    style: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }}
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <Phone color="action" sx={{ mr: 1 }} />
                <ListItemText 
                  primary={phone || 'N/A'} 
                  secondary="Phone"
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <LocationOn color="action" sx={{ mt: 0.5, mr: 1 }} />
                <ListItemText 
                  primary={
                    <Box>
                      <Typography variant="body1" component="div">
                        {formattedAddress || 'No address provided'}
                      </Typography>
                      {formattedAddress && (
                        <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                          {city && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocationCity color="action" fontSize="small" />
                              <Typography variant="body2" component="span">
                                {city}
                              </Typography>
                            </Box>
                          )}
                          {state && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocationOn color="action" fontSize="small" />
                              <Typography variant="body2" component="span">
                                {state}
                              </Typography>
                            </Box>
                          )}
                          {postalCode && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocalPostOffice color="action" fontSize="small" />
                              <Typography variant="body2" component="span">
                                {postalCode}
                              </Typography>
                            </Box>
                          )}
                          {country && country !== 'USA' && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Public color="action" fontSize="small" />
                              <Typography variant="body2" component="span">
                                {country}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  }
                  secondary="Address"
                />
              </ListItem>
            </List>
          </Paper>

          {/* Customer Stats */}
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Customer Stats" 
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <List>
                <ListItem>
                  <ShoppingCart color="primary" sx={{ mr: 1 }} />
                  <ListItemText 
                    primary={totalOrders || 0} 
                    secondary="Total Orders"
                  />
                </ListItem>
                <Divider component="li" variant="inset" />
                <ListItem>
                  <AttachMoney color="primary" sx={{ mr: 1 }} />
                  <ListItemText 
                    primary={formatCurrency(totalSpent)}
                    secondary="Total Spent"
                  />
                </ListItem>
                <Divider component="li" variant="inset" />
                <ListItem>
                  <AttachMoney color="primary" sx={{ mr: 1 }} />
                  <ListItemText 
                    primary={formatCurrency(avgOrderValue)}
                    secondary="Avg. Order Value"
                  />
                </ListItem>
                <Divider component="li" variant="inset" />
                <ListItem>
                  <CalendarToday color="primary" sx={{ mr: 1 }} />
                  <ListItemText 
                    primary={lastOrder || 'N/A'}
                    secondary="Last Order"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Details Tabs */}
        <Grid item xs={12} md={8} gridColumn={{ xs: 'span 12', md: 'span 8' }}>
          <Paper>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Orders" id="customer-tab-0" />
              <Tab label="Activity" id="customer-tab-1" />
              <Tab label="Details" id="customer-tab-2" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {orders.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order #</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                              {orders.slice(0, 10).map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              #{order.orderNumber || order.id}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {new Date(order.orderDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={order.status}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            ${order.totalAmount?.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <ShoppingCart color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    No orders found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This customer hasn't placed any orders yet.
                  </Typography>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box textAlign="center" py={4}>
                <CalendarToday color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Activity Log
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Customer activity log will be displayed here.
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Customer ID"
                    secondary={id}
                  />
                </ListItem>
                <Divider component="li" variant="inset" />
                <ListItem>
                  <ListItemText 
                    primary="Account Created"
                    secondary={customerSince}
                  />
                </ListItem>
                <Divider component="li" variant="inset" />
                <ListItem>
                  <ListItemText 
                    primary="Last Active"
                    secondary={customer.lastLoginAt 
                      ? new Date(customer.lastLoginAt).toLocaleString() 
                      : 'Never logged in'}
                  />
                </ListItem>
                <Divider component="li" variant="inset" />
                <ListItem>
                  <ListItemText 
                    primary="Email Verified"
                    secondary={customer.emailVerified ? 'Yes' : 'No'}
                  />
                </ListItem>
              </List>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerPage;
