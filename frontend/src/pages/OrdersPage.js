import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { CancelToken, isCancel } from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Chip,
  IconButton,
  TablePagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, LocalShipping, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  const orderStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(0);
    }, 500),
    [setSearchTerm, setPage]
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  const fetchOrders = useCallback(async () => {
    let isMounted = true;
    const source = CancelToken.source();

    try {
      setLoading(true);
      setError('');

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter,
        search: searchTerm
      };

      const response = await api.get('/api/orders', {
        params,
        cancelToken: source.token
      });

      if (isMounted) {
        const { data } = response;
        setOrders(Array.isArray(data) ? data : data.orders || []);
        setTotalCount(data.pagination?.total || data.length || 0);
      }
    } catch (err) {
      if (isMounted && !isCancel(err)) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
        showSnackbar('Failed to load orders', 'error');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      source.cancel('Operation canceled by the user.');
    };
  }, [page, rowsPerPage, statusFilter, searchTerm, showSnackbar]);

  useEffect(() => {
    const cleanup = fetchOrders();
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.catch(() => {});
      } else if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [fetchOrders]);

  const calculateOrderTotal = (order) => {
    try {
      // First, check if totalAmount is directly available and valid
      if (order.totalAmount !== undefined && order.totalAmount !== null) {
        const amount = parseFloat(order.totalAmount);
        if (!isNaN(amount)) {
          return amount;
        }
      }
      
      // If not, try to calculate from items if available
      if (Array.isArray(order.items) && order.items.length > 0) {
        const total = order.items.reduce((sum, item) => {
          const quantity = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          return sum + (quantity * price);
        }, 0);
        
        // Round to 2 decimal places and convert back to number
        return Math.round(total * 100) / 100;
      }
      
      // If we have a total field but it wasn't caught above, try to use it
      if (order.total !== undefined && order.total !== null) {
        const amount = parseFloat(order.total);
        if (!isNaN(amount)) {
          return amount;
        }
      }
      
      console.warn('Could not determine order total, using 0');
      return 0;
      
    } catch (error) {
      console.error('Error calculating order total:', error);
      return 0;
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      // Set loading state
      setOrderDetails({
        id: orderId,
        status: 'Loading...',
        orderDate: new Date().toISOString(),
        totalAmount: 0,
        items: [],
        customer: {
          name: 'Loading...',
          email: 'Loading...',
          phone: 'Loading...'
        }
      });

      try {
        // First try to get the order directly by ID
        const orderResponse = await api.get(`/api/orders/${orderId}`);
        
        // Handle the response based on its structure
        let orderData;
        if (orderResponse.data && orderResponse.data.orders) {
          orderData = orderResponse.data.orders[0] || orderResponse.data.orders;
        } else if (Array.isArray(orderResponse.data)) {
          orderData = orderResponse.data[0] || orderResponse.data;
        } else {
          orderData = orderResponse.data;
        }
        
        if (orderData) {
          // Ensure we have customer data
          let customer = orderData.customer || {};
          
          // If we have customerId but no customer object, try to fetch customer details
          if ((!customer || !customer.id) && orderData.customerId) {
            try {
              const customerResponse = await api.get(`/api/customers/${orderData.customerId}`);
              if (customerResponse.data) {
                customer = customerResponse.data;
              }
            } catch (customerError) {
              console.error('Error fetching customer details:', customerError);
              // Continue with partial customer data
            }
          }
          
          // Calculate the total amount
          const totalAmount = calculateOrderTotal(orderData);
          
          // Format the order data for the UI
          const formattedOrder = {
            ...orderData,
            // Use orderNumber if available, otherwise fall back to ID
            orderNumber: orderData.orderNumber || `ORD-${orderData.id}`,
            totalAmount: totalAmount,
            items: Array.isArray(orderData.items) ? orderData.items : [],
            customer: {
              id: customer.id || orderData.customerId || null,
              name: customer.name || 'Unknown Customer',
              email: customer.email || 'No email provided',
              phone: customer.phone || 'No phone provided'
            }
          };
          
          setOrderDetails(formattedOrder);
          return;
        }
      } catch (directError) {
        console.log('Direct order fetch failed, trying fallback...', directError);
      }
      
      // Fallback: Try to fetch all orders and find the specific one
      try {
        const response = await api.get('/api/orders');
        let orders = [];
        
        if (response.data && Array.isArray(response.data.orders)) {
          orders = response.data.orders;
        } else if (Array.isArray(response.data)) {
          orders = response.data;
        }
        
        // Try to find by ID first
        let order = orders.find(o => o.id === parseInt(orderId));
        
        // If not found by ID, try to find by orderNumber
        if (!order) {
          order = orders.find(o => o.orderNumber === orderId);
        }
        
        if (order) {
          // Ensure we have customer data
          let customer = order.customer || {};
          
          // If we have customerId but no customer object, try to fetch customer details
          if ((!customer || !customer.id) && order.customerId) {
            try {
              const customerResponse = await api.get(`/api/customers/${order.customerId}`);
              if (customerResponse.data) {
                customer = customerResponse.data;
              }
            } catch (customerError) {
              console.error('Error fetching customer details:', customerError);
              // Continue with partial customer data
            }
          }
          
          // Calculate the total amount
          const totalAmount = calculateOrderTotal(order);
          
          // Format the order data for the UI
          const formattedOrder = {
            ...order,
            // Use orderNumber if available, otherwise fall back to ID
            orderNumber: order.orderNumber || `ORD-${order.id}`,
            totalAmount: totalAmount,
            items: Array.isArray(order.items) ? order.items : [],
            customer: {
              id: customer.id || order.customerId || null,
              name: customer.name || 'Unknown Customer',
              email: customer.email || 'No email provided',
              phone: customer.phone || 'No phone provided'
            }
          };
          
          setOrderDetails(formattedOrder);
          return;
        }
      } catch (fallbackError) {
        console.error('Fallback order fetch failed:', fallbackError);
        throw fallbackError;
      }
      
      throw new Error('Order not found');
      
    } catch (error) {
      console.error('Error in fetchOrderDetails:', error);
      showSnackbar('Failed to load order details', 'error');
      
      // Set error state with the order ID
      setOrderDetails({
        id: orderId,
        orderNumber: `ORD-${orderId}`,
        status: 'Error',
        orderDate: new Date().toISOString(),
        totalAmount: 0,
        items: [],
        customer: {
          id: null,
          name: 'Error loading customer',
          email: 'Error',
          phone: 'Error'
        }
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSetSearchTerm(value);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    await fetchOrderDetails(order.id);
    setOpenDialog(true);
  };

  const handleEditOrder = (order) => {
    navigate(`/orders/edit/${order.id}`);
  };

  const handleDeleteOrder = async (order) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/api/orders/${order.id}`);
        await fetchOrders();
        showSnackbar('Order deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting order:', error);
        showSnackbar('Failed to delete order', 'error');
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status: newStatus });
      await fetchOrders();
      showSnackbar(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      const message = error.response?.data?.message || 'Failed to update order status';
      showSnackbar(message, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { text: '#B76E00', background: '#FFF3E0' };
      case 'processing':
        return { text: '#0057B7', background: '#E3F2FD' };
      case 'shipped':
        return { text: '#5D4037', background: '#EFEBE9' };
      case 'delivered':
        return { text: '#1B5E20', background: '#E8F5E9' };
      case 'cancelled':
        return { text: '#C62828', background: '#FFEBEE' };
      default:
        return { text: '#424242', background: '#F5F5F5' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Order Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/orders/new')}
        >
          New Order
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Search orders..."
          value={searchTerm}
          onChange={handleSearch}
          variant="outlined"
          sx={{ flex: 1 }}
          placeholder="Search by order ID, customer name, or email"
          InputProps={{
            endAdornment: searchTerm && (
              <IconButton
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  setPage(0);
                }}
                edge="end"
              >
                ✕
              </IconButton>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200, ml: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilter}
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
            endAdornment={
              statusFilter && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter('');
                    setPage(0);
                  }}
                  sx={{ mr: 1 }}
                >
                  ✕
                </IconButton>
              )
            }
          >
            {orderStatuses.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: (theme) => {
                        const colorMap = {
                          pending: theme.palette.warning.main,
                          processing: theme.palette.info.main,
                          shipped: theme.palette.primary.main,
                          delivered: theme.palette.success.main,
                          cancelled: theme.palette.error.main,
                          '': theme.palette.grey[500]
                        };
                        return colorMap[status.value] || theme.palette.grey[500];
                      },
                    }}
                  />
                  {status.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {error || 'No orders found'}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.orderNumber || order.id}</TableCell>
                    <TableCell>
                      {order.customer?.name || 'N/A'}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        {order.customer?.email || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {order.orderDate ? formatDate(order.orderDate) : 'N/A'}
                    </TableCell>
                    <TableCell>${order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          color: getStatusColor(order.status).text,
                          backgroundColor: getStatusColor(order.status).background,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          display: 'inline-block'
                        }}
                      >
                        {order.status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {Array.isArray(order.items) ? order.items.length : 0}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleViewOrder(order)} 
                        size="small"
                        title="View Order Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleEditOrder(order)} 
                        size="small"
                        title="Edit Order"
                        sx={{ color: 'primary.main' }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteOrder(order)} 
                        size="small"
                        title="Delete Order"
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                      {order.status === 'processing' && (
                        <IconButton 
                          onClick={() => handleUpdateStatus(order.id, 'shipped')} 
                          size="small"
                          title="Mark as Shipped"
                        >
                          <LocalShipping />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Order Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {orderDetails ? (
            <Box>
              <Typography variant="h6" gutterBottom>Customer Information</Typography>
              {orderDetails.customer ? (
                <>
                  <Typography>Name: {orderDetails.customer.name || 'N/A'}</Typography>
                  <Typography>Email: {orderDetails.customer.email || 'N/A'}</Typography>
                  <Typography>Phone: {orderDetails.customer.phone || 'N/A'}</Typography>
                </>
              ) : orderDetails.customerId ? (
                <Typography>Loading customer details...</Typography>
              ) : (
                <Typography>No customer information available</Typography>
              )}
              
              {/* Debug info - can be removed in production */}
              {process.env.NODE_ENV === 'development' && (
                <Box mt={2} p={1} bgcolor="#f5f5f5" borderRadius={1}>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Order ID:</strong> {orderDetails.id}<br />
                    <strong>Customer ID:</strong> {orderDetails.customerId || orderDetails.customer?.id || 'N/A'}
                  </Typography>
                </Box>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Order Information</Typography>
              <Typography>Order Date: {formatDate(orderDetails.orderDate)}</Typography>
              <Typography>Status: {orderDetails.status}</Typography>
              <Typography>
                Total: ${typeof orderDetails.totalAmount === 'number' 
                  ? orderDetails.totalAmount.toFixed(2) 
                  : '0.00'}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Order Items</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetails.items?.length > 0 ? (
                      <>
                        {orderDetails.items.map((item, index) => {
                          const quantity = Number(item.quantity) || 0;
                          const price = Number(item.price) || 0;
                          const itemTotal = quantity * price;
                          
                          return (
                            <TableRow key={index}>
                              <TableCell component="th" scope="row">
                                {item.product?.name || item.productName || 'Unnamed Product'}
                              </TableCell>
                              <TableCell align="right">{quantity}</TableCell>
                              <TableCell align="right">${price.toFixed(2)}</TableCell>
                              <TableCell align="right">${itemTotal.toFixed(2)}</TableCell>
                            </TableRow>
                          );
                        })}
                        
                        {/* Subtotal, Tax, and Grand Total */}
                        {(() => {
                          const subtotal = orderDetails.items.reduce((sum, item) => {
                            const quantity = Number(item.quantity) || 0;
                            const price = Number(item.price) || 0;
                            return sum + (quantity * price);
                          }, 0);
                          
                          // Calculate tax (assuming 10% tax rate)
                          const taxRate = 0.10;
                          const tax = subtotal * taxRate;
                          const grandTotal = subtotal + tax;
                          
                          return (
                            <>
                              <TableRow>
                                <TableCell rowSpan={3} />
                                <TableCell colSpan={2} align="right">
                                  <strong>Subtotal:</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>${subtotal.toFixed(2)}</strong>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={2} align="right">
                                  <strong>Tax ({taxRate * 100}%):</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>${tax.toFixed(2)}</strong>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={2} align="right">
                                  <strong>Grand Total:</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>${grandTotal.toFixed(2)}</strong>
                                </TableCell>
                              </TableRow>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">
                            No items found in this order
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedOrder?.status === 'pending' && (
            <Button 
              onClick={() => {
                handleUpdateStatus(selectedOrder.id, 'processing');
                setOpenDialog(false);
              }}
              variant="contained"
            >
              Mark as Processing
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}