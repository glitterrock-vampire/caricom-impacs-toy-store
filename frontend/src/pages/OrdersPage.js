import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
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
  DialogActions
} from '@mui/material';
import { Visibility, Edit, LocalShipping } from '@mui/icons-material';
import api from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  const orderStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Create a debounced version of setSearchTerm
  const debouncedSetSearchTerm = React.useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(0);
    }, 500),
    []
  );

  // Cleanup debounce on component unmount
  React.useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);
  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      // Prepare query parameters
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
  
      // Add search filter if provided
      if (searchTerm) {
        params.search = searchTerm;
      }
  
      // Add status filter if provided
      if (statusFilter) {
        params.status = statusFilter;
      }
  
      console.log('Fetching orders with params:', params);
      
      const response = await api.get('/api/orders', { params });
      
      // Handle the response structure
      // The backend should return { orders: [], pagination: { total, page, limit, pages } }
      const ordersData = Array.isArray(response.data.orders) ? response.data.orders : [];
      const total = response.data.pagination?.total || ordersData.length;
      
      console.log('Fetched orders:', ordersData);
      console.log('Pagination info:', response.data.pagination);
      
      setOrders(ordersData);
      setTotalCount(total);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
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
    // Update the input field immediately for better UX
    setSearchTerm(value);
    // Use the debounced function to update the search term after a delay
    debouncedSetSearchTerm(value);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(0); // Reset to first page when changing status
  };

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    await fetchOrderDetails(order.id);
    setOpenDialog(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
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
                <TableCell>Order ID</TableCell>
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
          {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
        </TableCell>
        <TableCell>${order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
        <TableCell>
          <Chip
            label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'N/A'}
            color={getStatusColor(order.status)}
            size="small"
          />
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
              <Typography>Name: {orderDetails.customer?.name}</Typography>
              <Typography>Email: {orderDetails.customer?.email}</Typography>
              <Typography>Phone: {orderDetails.customer?.phone || 'N/A'}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Order Information</Typography>
              <Typography>Order Date: {formatDate(orderDetails.orderDate)}</Typography>
              <Typography>Status: {orderDetails.status}</Typography>
              <Typography>Total: ${orderDetails.totalAmount?.toFixed(2)}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Items</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product?.name || item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price?.toFixed(2)}</TableCell>
                      <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
    </Container>
  );
}
