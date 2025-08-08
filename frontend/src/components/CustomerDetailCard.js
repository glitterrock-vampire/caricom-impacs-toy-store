import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Box,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  ShoppingCart,
  CalendarToday,
  Edit,
  Delete,
  Visibility,
  LocalShipping,
  Receipt,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import OrderDetailModal from './OrderDetailModal';
import { useNavigate } from 'react-router-dom';

const CustomerDetailCard = ({ 
  customer = { name: '', email: '', phone: '' }, 
  onEdit = () => {}, 
  onDelete = () => {}, 
  onViewOrders = () => {},
  orders = [],
  totalSpent: propTotalSpent,
  totalOrders: propTotalOrders,
  avgOrderValue: propAvgOrderValue,
  lastOrderDate: propLastOrderDate
}) => {
  const [open, setOpen] = useState(false);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Calculate derived values
  const { totalSpent, totalOrders, avgOrderValue, lastOrderDate } = useMemo(() => {
    try {
      // Calculate from orders if not provided
      const calculatedTotalOrders = propTotalOrders >= 0 ? propTotalOrders : (Array.isArray(orders) ? orders.length : 0);
      
      const calculatedTotalSpent = propTotalSpent >= 0 
        ? propTotalSpent 
        : (Array.isArray(orders) ? orders.reduce((sum, order) => {
            const amount = parseFloat(order.totalAmount || order.total || 0);
            return isNaN(amount) ? sum : sum + amount;
          }, 0) : 0);
      
      const calculatedAvgOrder = propAvgOrderValue >= 0
        ? propAvgOrderValue
        : (calculatedTotalOrders > 0 ? calculatedTotalSpent / calculatedTotalOrders : 0);
      
      // Find the most recent order date
      let calculatedLastOrder = propLastOrderDate;
      if (!calculatedLastOrder && Array.isArray(orders) && orders.length > 0) {
        const validOrders = orders.filter(order => order && (order.orderDate || order.date));
        if (validOrders.length > 0) {
          const sortedOrders = [...validOrders].sort((a, b) => {
            const dateA = new Date(a.orderDate || a.date);
            const dateB = new Date(b.orderDate || b.date);
            return dateB - dateA;
          });
          calculatedLastOrder = sortedOrders[0]?.orderDate || sortedOrders[0]?.date;
        }
      }

      return {
        totalSpent: calculatedTotalSpent,
        totalOrders: calculatedTotalOrders,
        avgOrderValue: calculatedAvgOrder,
        lastOrderDate: calculatedLastOrder
      };
    } catch (error) {
      console.error('Error calculating order statistics:', error);
      return {
        totalSpent: propTotalSpent || 0,
        totalOrders: propTotalOrders || 0,
        avgOrderValue: propAvgOrderValue || 0,
        lastOrderDate: propLastOrderDate || null
      };
    }
  }, [orders, propTotalSpent, propTotalOrders, propAvgOrderValue, propLastOrderDate]);

  const navigate = useNavigate();

  const recentOrders = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return [];
    
    try {
      return [...orders]
        .filter(order => order && (order.orderDate || order.date))
        .sort((a, b) => {
          try {
            const dateA = new Date(a.orderDate || a.date);
            const dateB = new Date(b.orderDate || b.date);
            return dateB - dateA;
          } catch (error) {
            console.error('Error sorting orders:', error);
            return 0;
          }
        })
        .slice(0, 5);
    } catch (error) {
      console.error('Error processing recent orders:', error);
      return [];
    }
  }, [orders]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing':
      case 'pending': return 'warning';
      case 'cancelled': 
      case 'declined': return 'error';
      default: return 'default';
    }
  };

  // Format address from object or string
  const formatAddress = (addressObj) => {
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
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    const num = parseFloat(amount);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  return (
    <>
      {/* Card Content - Same as before but with the new calculated values */}
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          }
        }}
        onClick={handleClickOpen}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56, 
                mr: 2,
                fontSize: '1.5rem'
              }}
            >
              {customer.name?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {customer.name || 'Unknown Customer'}
              </Typography>
              <Chip 
                label={`${totalOrders} Order${totalOrders !== 1 ? 's' : ''}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <Email sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {customer.email || 'No email provided'}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Phone sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {customer.phone || 'No phone provided'}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box textAlign="center">
              <Typography variant="h6" color="primary">
                {formatCurrency(totalSpent)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Spent
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="secondary">
                {totalOrders}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Orders
              </Typography>
            </Box>
            <Box textAlign="center" minWidth={80}>
              <Typography variant="subtitle2" noWrap>
                Last Order
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {formatDate(lastOrderDate)}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            <Button
              size="small"
              startIcon={<Visibility />}
              onClick={(e) => {
                e.stopPropagation();
                handleClickOpen();
              }}
              sx={{ mr: 1 }}
            >
              Quick View
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/customers/${customer.id}`);
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                }
              }}
            >
              Full Profile
            </Button>
          </Box>
          <Box>
            <Tooltip title="Edit Customer">
              <IconButton 
                size="small" 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(customer);
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Customer">
              <IconButton 
                size="small" 
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(customer.id);
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>

      {/* Detailed Modal */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 64, 
                height: 64, 
                mr: 2,
                fontSize: '1.75rem'
              }}
            >
              {customer.name?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2">
                {customer.name || 'Unknown Customer'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer ID: {customer.id ? `#${customer.id}` : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Contact Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={customer.email || 'N/A'}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={customer.phone || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Address" 
                    secondary={formatAddress(customer.address) || 'N/A'}
                    secondaryTypographyProps={{ 
                      style: { 
                        whiteSpace: 'pre-line' 
                      } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Member Since" 
                    secondary={customer.createdAt ? formatDate(customer.createdAt) : 'N/A'}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Order Statistics */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCart sx={{ mr: 1 }} />
                Order Statistics
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Total Orders:</Typography>
                  <Chip 
                    label={totalOrders} 
                    color="primary" 
                    size="small" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Total Spent:</Typography>
                  <Chip 
                    label={formatCurrency(totalSpent)} 
                    color="success" 
                    size="small" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Average Order:</Typography>
                  <Chip 
                    label={formatCurrency(avgOrderValue)} 
                    color="info" 
                    size="small" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Last Order:</Typography>
                  <Typography variant="body2">
                    {formatDate(lastOrderDate)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Recent Orders */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Receipt sx={{ mr: 1 }} />
                  Recent Orders
                </Typography>
                {orders.length > 5 && (
                  <Button 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrders(customer.id);
                    }}
                  >
                    View All ({orders.length})
                  </Button>
                )}
              </Box>
              <List>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <ListItem
                      key={order.id}
                      divider
                      button
                      onClick={() => handleViewOrderDetail(order)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemIcon>
                        <LocalShipping color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Order #${order.orderNumber || order.id || 'N/A'}`}
                        secondary={formatDate(order.orderDate || order.date)}
                      />
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(order.totalAmount || order.total)}
                        </Typography>
                        <Chip
                          label={order.status || 'unknown'}
                          color={getStatusColor(order.status)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No orders found
                  </Typography>
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">
            Close
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Edit />}
            onClick={() => {
              handleClose();
              onEdit(customer);
            }}
          >
            Edit Customer
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ShoppingCart />}
            onClick={() => {
              handleClose();
              onViewOrders(customer.id);
            }}
            disabled={!orders.length}
          >
            View All Orders
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={orderDetailOpen}
        onClose={handleCloseOrderDetail}
        order={selectedOrder}
        customer={customer}
      />
    </>
  );
};

CustomerDetailCard.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
  orders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orderNumber: PropTypes.string,
    orderDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    totalAmount: PropTypes.number,
    total: PropTypes.number,
    status: PropTypes.string,
  })),
  totalSpent: PropTypes.number,
  totalOrders: PropTypes.number,
  avgOrderValue: PropTypes.number,
  lastOrderDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewOrders: PropTypes.func,
};

CustomerDetailCard.defaultProps = {
  orders: [],
  totalSpent: -1, // Use -1 to indicate it should be calculated
  totalOrders: -1, // Use -1 to indicate it should be calculated
  avgOrderValue: -1, // Use -1 to indicate it should be calculated
  lastOrderDate: null,
  onEdit: () => {},
  onDelete: () => {},
  onViewOrders: () => {},
};

export default CustomerDetailCard;