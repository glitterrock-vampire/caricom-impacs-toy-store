import React, { useState, useEffect } from 'react';
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
  IconButton
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
  Delete
} from '@mui/icons-material';
import axios from 'axios';

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

const CustomerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        // First get customer details
        const customerData = await customerService.getCustomerById(id);
        setCustomer(customerData);
        
        // Then get customer orders
        try {
          const ordersData = await customerService.getCustomerOrders(id);
          setOrders(ordersData.data || []);
        } catch (ordersError) {
          console.error('Error fetching customer orders:', ordersError);
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError(err.message || 'Failed to load customer details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, navigate]);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Container>
    );
  }

  if (!customer) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6">Customer not found</Typography>
      </Container>
    );
  }

  const { name, email, phone, address, city, state, postalCode, country, createdAt } = customer;
  const fullAddress = `${address || ''}, ${city || ''}, ${state || ''} ${postalCode || ''} ${country || ''}`;
  const customerSince = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate customer stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

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
              <ListItem>
                <LocationOn color="action" sx={{ mr: 1 }} />
                <ListItemText 
                  primary={fullAddress.trim().replace(/^,\s*|\s*,/g, '') || 'No address provided'} 
                  secondary="Address"
                  primaryTypographyProps={{ style: { whiteSpace: 'pre-line' } }}
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
                    primary={totalOrders} 
                    secondary="Total Orders"
                  />
                </ListItem>
                <Divider component="li" variant="inset" />
                <ListItem>
                  <AttachMoney color="primary" sx={{ mr: 1 }} />
                  <ListItemText 
                    primary={`$${totalSpent.toFixed(2)}`} 
                    secondary="Total Spent"
                  />
                </ListItem>
                <Divider component="li" variant="inset" />
                <ListItem>
                  <AttachMoney color="primary" sx={{ mr: 1 }} />
                  <ListItemText 
                    primary={`$${avgOrderValue.toFixed(2)}`} 
                    secondary="Avg. Order Value"
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
                      {orders.map((order) => (
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
