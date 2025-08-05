import React, { useState } from 'react';
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
import OrderDetailModal from './OrderDetailModal';

const CustomerDetailCard = ({ 
  customer = { name: '', email: '', phone: '' }, 
  onEdit = () => {}, 
  onDelete = () => {}, 
  onViewOrders = () => {},
  orders = [],
  totalSpentProp = 0,
  totalOrdersProp = 0,
  avgOrderValueProp = 0,
  lastOrderDate = null 
}) => {
  const [open, setOpen] = useState(false);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const recentOrders = orders.slice(0, 5); // Show only the 5 most recent orders

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  // Mock order data - in real app this would come from props or API
  const mockOrders = [
    { id: 1, date: '2024-01-15', total: 125.50, status: 'delivered', items: 3 },
    { id: 2, date: '2024-01-20', total: 89.99, status: 'shipped', items: 2 },
    { id: 3, date: '2024-01-25', total: 156.75, status: 'pending', items: 4 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // const totalSpentProp = mockOrders.reduce((sum, order) => sum + order.total, 0);
  // const totalOrdersProp = mockOrders.length;

  return (
    <>
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
              {customer.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {customer.name}
              </Typography>
              <Chip 
                label={`${totalOrdersProp} Orders`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <Email sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {customer.email}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Phone sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {customer.phone}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box textAlign="center">
            <Typography variant="h6" color="primary">
              ${(totalSpentProp || 0).toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Spent
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" color="secondary">
              {totalOrdersProp || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Orders
            </Typography>
          </Box>
          {lastOrderDate && (
            <Box textAlign="center">
              <Typography variant="subtitle2">
                Last Order
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(lastOrderDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={(e) => {
              e.stopPropagation();
              handleClickOpen();
            }}
          >
            View Details
          </Button>
          <Box>
            <Tooltip title="Edit Customer">
              <IconButton 
                size="small" 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(customer);
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
                  onDelete && onDelete(customer.id);
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
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
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
              {customer.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2">
                {customer.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer ID: #{customer.id}
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
                    secondary={customer.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={customer.phone}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Member Since" 
                    secondary="January 2024"
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Order Statistics */}
\            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCart sx={{ mr: 1 }} />
                Order Statistics
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Total Orders:</Typography>
                  <Chip label={totalOrdersProp} color="primary" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Total Spent:</Typography>
                  <Chip 
                    label={`$${totalSpentProp.toFixed(2)}`} 
                    color="success" 
                    size="small" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Average Order:</Typography>
                  <Chip 
                    label={`$${avgOrderValueProp.toFixed(2)}`} 
                    color="info" 
                    size="small" 
                  />
                </Box>
                {lastOrderDate && (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Last Order:</Typography>
                    <Typography variant="body2">
                      {new Date(lastOrderDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
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
                    onClick={() => onViewOrders && onViewOrders(customer.id)}
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
                        primary={`Order #${order.id}`}
                        secondary={new Date(order.order_date || order.date).toLocaleDateString()}
                      />
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          ${(order?.total_amount || order?.total || 0).toFixed(2)}
                        </Typography>
                        <Chip
                          label={order.status}
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
              onEdit && onEdit(customer);
            }}
          >
            Edit Customer
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ShoppingCart />}
            onClick={() => {
              handleClose();
              onViewOrders && onViewOrders(customer.id);
            }}
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

export default CustomerDetailCard;
