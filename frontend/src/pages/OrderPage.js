import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip, 
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { ArrowBack, LocalShipping, Payment, Person, Email, Phone, LocationOn } from '@mui/icons-material';
import { orderService } from '../services/orderService';

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await orderService.getOrderById(id);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

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

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6">Order not found</Typography>
      </Container>
    );
  }

  const { customer, orderItems = [] } = order;

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
        <Grid item xs={12} md={8} gridColumn={{ xs: 'span 12', md: 'span 8' }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" component="h1">
                Order #{order.orderNumber || id}
              </Typography>
              <Chip 
                label={order.status}
                color={getStatusColor(order.status)}
                variant="outlined"
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Order Items</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.name || 'Product not found'}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.unitPrice?.toFixed(2)}</TableCell>
                      <TableCell align="right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Subtotal</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${order.subtotal?.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Tax</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${(order.taxAmount || 0).toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Shipping</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${(order.shippingCost || 0).toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${order.totalAmount?.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Order Notes
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {order.notes || 'No notes available'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} gridColumn={{ xs: 'span 12', md: 'span 4' }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Customer Information</Typography>
            <List>
              <ListItem>
                <Person color="action" sx={{ mr: 1 }} />
                <ListItemText 
                  primary={customer?.name || 'N/A'} 
                  secondary="Customer Name"
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <Email color="action" sx={{ mr: 1 }} />
                <ListItemText 
                  primary={customer?.email || 'N/A'} 
                  secondary="Email"
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <Phone color="action" sx={{ mr: 1 }} />
                <ListItemText 
                  primary={customer?.phone || 'N/A'} 
                  secondary="Phone"
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <LocationOn color="action" sx={{ mr: 1 }} />
                <ListItemText 
                  primary={`${customer?.address || ''}, ${customer?.city || ''} ${customer?.state || ''} ${customer?.postalCode || ''}`} 
                  secondary="Shipping Address"
                  primaryTypographyProps={{ style: { whiteSpace: 'pre-line' } }}
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Order Details</Typography>
            <List>
              <ListItem>
                <LocalShipping color="action" sx={{ mr: 1 }} />
                <ListItemText 
                  primary={order.shippingMethod || 'Standard Shipping'} 
                  secondary="Shipping Method"
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <Payment color="action" sx={{ mr: 1 }} />
                <ListItemText 
                  primary={order.paymentMethod || 'Credit Card'} 
                  secondary="Payment Method"
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <ListItemText 
                  primary={new Date(order.orderDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} 
                  secondary="Order Date"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderPage;
