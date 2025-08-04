import React, { useState } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  AttachMoney,
  LocalShipping,
  Receipt,
  Add,
  Remove,
} from '@mui/icons-material';

const OrderDetailsModal = ({ open, onClose, order, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);

  React.useEffect(() => {
    if (order) {
      setEditedOrder({
        ...order,
        items: order.items || []
      });
    }
  }, [order]);

  if (!order || !editedOrder) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate(editedOrder);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleCancel = () => {
    setEditedOrder({ ...order });
    setIsEditing(false);
  };

  const handleStatusChange = (event) => {
    setEditedOrder({
      ...editedOrder,
      status: event.target.value
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const calculateTotal = () => {
    return editedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const updateItemQuantity = (index, newQuantity) => {
    const updatedItems = [...editedOrder.items];
    updatedItems[index].quantity = Math.max(1, newQuantity);
    setEditedOrder({
      ...editedOrder,
      items: updatedItems
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, height: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Receipt sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h5" component="h2">
                Order #{order.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed on {new Date(order.orderDate || order.date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
              >
                Edit Order
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Order Details" />
          <Tab label="Customer Info" />
          <Tab label="Items" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Order Details Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Receipt color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Order ID" 
                          secondary={`#${order.id}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Order Date" 
                          secondary={new Date(order.orderDate || order.date).toLocaleDateString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocalShipping color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Status" 
                          secondary={
                            isEditing ? (
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={editedOrder.status}
                                  onChange={handleStatusChange}
                                >
                                  <MenuItem value="pending">Pending</MenuItem>
                                  <MenuItem value="shipped">Shipped</MenuItem>
                                  <MenuItem value="delivered">Delivered</MenuItem>
                                  <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                              </FormControl>
                            ) : (
                              <Chip
                                label={order.status}
                                color={getStatusColor(order.status)}
                                size="small"
                              />
                            )
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AttachMoney color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Total Amount" 
                          secondary={`$${calculateTotal().toFixed(2)}`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Customer Info Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Person color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Name" 
                          secondary={order.customer?.name || 'Unknown Customer'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Email color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email" 
                          secondary={order.customer?.email || 'No email provided'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Phone color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Phone" 
                          secondary={order.customer?.phone || 'No phone provided'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Items Tab */}
          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
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
                        {isEditing && <TableCell align="center">Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {editedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {item.name || item.product?.name || 'Unknown Item'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {isEditing ? (
                              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                <IconButton
                                  size="small"
                                  onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Remove />
                                </IconButton>
                                <Typography>{item.quantity}</Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                >
                                  <Add />
                                </IconButton>
                              </Box>
                            ) : (
                              item.quantity
                            )}
                          </TableCell>
                          <TableCell align="right">${item.price?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold">
                              ${((item.price || 0) * item.quantity).toFixed(2)}
                            </Typography>
                          </TableCell>
                          {isEditing && (
                            <TableCell align="center">
                              <Tooltip title="Remove Item">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    const updatedItems = editedOrder.items.filter((_, i) => i !== index);
                                    setEditedOrder({
                                      ...editedOrder,
                                      items: updatedItems
                                    });
                                  }}
                                >
                                  <Remove />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={isEditing ? 4 : 3} align="right">
                          <Typography variant="h6" fontWeight="bold">Total:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            ${calculateTotal().toFixed(2)}
                          </Typography>
                        </TableCell>
                        {isEditing && <TableCell />}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button variant="outlined">
          Print Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsModal;
