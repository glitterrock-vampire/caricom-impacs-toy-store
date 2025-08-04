import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  CalendarToday,
  LocationOn,
  AttachMoney,
  LocalShipping,
  Receipt,
  Phone,
  Email,
} from '@mui/icons-material';

const OrderDetailModal = ({ open, onClose, order, customer }) => {
  if (!order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <Receipt />;
      case 'shipped': return <LocalShipping />;
      case 'pending': return <ShoppingCart />;
      case 'cancelled': return <Receipt />;
      default: return <ShoppingCart />;
    }
  };

  // Calculate order totals
  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || order.total || 0;
  const tax = subtotal * 0.15; // 15% tax
  const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
  const total = subtotal + tax + shipping;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <Receipt />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2">
                Order #{order.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed on {new Date(order.date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={getStatusIcon(order.status)}
            label={order.status.toUpperCase()}
            color={getStatusColor(order.status)}
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Customer Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Person color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Name" 
                      secondary={customer?.name || 'Unknown Customer'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Email color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={customer?.email || 'No email provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Phone" 
                      secondary={customer?.phone || 'No phone provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Address" 
                      secondary={customer?.address || 'No address provided'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCart sx={{ mr: 1 }} />
                  Order Summary
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Order Date" 
                      secondary={new Date(order.date).toLocaleDateString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Total Amount" 
                      secondary={`$${total.toFixed(2)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocalShipping color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip
                          label={order.status.toUpperCase()}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  {customer?.notes && (
                    <ListItem>
                      <ListItemText 
                        primary="Customer Notes" 
                        secondary={customer.notes}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Receipt sx={{ mr: 1 }} />
                  Order Items
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {item.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography color="text.secondary">
                              No item details available
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {/* Order Totals */}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="body2">Subtotal:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="body2">Tax (15%):</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">${tax.toFixed(2)}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="body2">Shipping:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="h6" fontWeight="bold">Total:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            ${total.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button variant="outlined">
          Print Receipt
        </Button>
        <Button variant="contained">
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;
