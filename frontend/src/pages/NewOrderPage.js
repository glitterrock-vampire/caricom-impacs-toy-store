import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';

const NewOrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Calculate initial delivery date based on standard shipping
  const getInitialDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5); // Standard shipping: 5 days
    return deliveryDate.toISOString().split('T')[0];
  };

  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    deliveryAddress: '',
    deliveryDate: getInitialDeliveryDate(),
    notes: '',
    shippingMethod: 'standard',
    items: [{ productId: '', quantity: 1, price: 0 }],
  });

  // Fetch customers and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch customers with full details including address
        const customersResponse = await customerService.getCustomers();
        const customersList = Array.isArray(customersResponse) 
          ? customersResponse 
          : customersResponse?.customers || [];
        
        console.log('Fetched customers:', customersList); // Debug log
        setCustomers(customersList);
        
        // Fetch products
        const productsData = await productService.getProducts();
        setProducts(Array.isArray(productsData) ? productsData : productsData?.products || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        showSnackbar('Failed to load required data. Please refresh the page.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const calculateDeliveryDate = (shippingMethod) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    
    switch(shippingMethod) {
      case 'overnight':
        deliveryDate.setDate(today.getDate() + 1);
        break;
      case 'express':
        deliveryDate.setDate(today.getDate() + 2);
        break;
      case 'standard':
        deliveryDate.setDate(today.getDate() + 5);
        break;
      case 'pickup':
        deliveryDate.setDate(today.getDate() + 0); // Same day pickup
        break;
      default:
        deliveryDate.setDate(today.getDate() + 5); // Default to standard
    }
    
    // Format as YYYY-MM-DD for the date input
    return deliveryDate.toISOString().split('T')[0];
  };

  const formatAddress = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    
    // Format address object to string
    const { street, city, state, postalCode, country } = address;
    const parts = [];
    if (street) parts.push(street);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (postalCode) parts.push(postalCode);
    if (country) parts.push(country);
    
    return parts.join(', ');
  };

  const parseAddress = (addressStr) => {
    if (!addressStr || typeof addressStr !== 'string') return null;
    // This is a simplified parser - adjust based on your address format
    const [street, city, state, postalCode, country] = addressStr.split(',').map(s => s.trim());
    return { street, city, state, postalCode, country };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If customer is selected, pre-fill the delivery address
    if (name === 'customerId') {
      const selectedCustomer = customers.find(c => c.id === value);
      console.log('Selected customer:', selectedCustomer);
      
      if (selectedCustomer) {
        // Try different possible address fields
        const customerAddress = selectedCustomer.address || 
                              selectedCustomer.shippingAddress || 
                              selectedCustomer.billingAddress ||
                              (selectedCustomer.addresses && 
                               (selectedCustomer.addresses.shipping || 
                                selectedCustomer.addresses.billing || 
                                selectedCustomer.addresses[0]));
        
        console.log('Customer address:', customerAddress);
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          deliveryAddress: formatAddress(customerAddress) || ''
        }));
        return;
      }
    }
    
    // If shipping method changes, update the delivery date
    if (name === 'shippingMethod') {
      const newDeliveryDate = calculateDeliveryDate(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        deliveryDate: newDeliveryDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    
    // If product is changed, update the price
    if (field === 'productId') {
      // Don't convert to number, keep as string if it's a string
      const selectedProduct = products.find(p => 
        p.id === value || p.id.toString() === value.toString()
      );
      
      if (!selectedProduct) {
        console.error('Selected product not found:', value);
        return;
      }
      
      updatedItems[index] = {
        ...updatedItems[index],
        productId: selectedProduct.id, // Keep the original ID format
        price: selectedProduct.price || 0
      };
    } else if (field === 'quantity') {
      const quantity = Math.max(1, parseInt(value) || 1);
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: quantity
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }
    
    // Filter out any invalid items (where productId is missing or invalid)
    const validItems = updatedItems.filter(item => 
      item.productId && item.quantity > 0
    );
    
    // If all items are valid or we have no items, update the form
    setFormData(prev => ({
      ...prev,
      items: validItems.length > 0 ? validItems : updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const calculateTotal = (items = formData.items) => {
    return items.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = Number(item.quantity) || 0;
      return total + (quantity * price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.customerId) {
      showSnackbar('Please select a customer', 'error');
      return;
    }
    
    // Log form data for debugging
    console.log('Form data before processing:', {
      customerId: formData.customerId,
      customerIdType: typeof formData.customerId,
      items: formData.items.map(item => ({
        productId: item.productId,
        productIdType: typeof item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryAddress: formData.deliveryAddress,
      deliveryDate: formData.deliveryDate,
      shippingMethod: formData.shippingMethod
    });
    
    // Filter out any empty items and validate
    const validItems = formData.items.filter(item => item.productId && item.quantity > 0);
    
    if (validItems.length === 0) {
      showSnackbar('Please add at least one product to the order', 'error');
      return;
    }

    // Prepare order data with proper types
    const orderData = {
      customerId: Number(formData.customerId), // Ensure customerId is a number
      items: validItems.map(item => ({
        productId: String(item.productId), // Ensure productId is a string to match schema
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
      deliveryAddress: parseAddress(formData.deliveryAddress) || formData.deliveryAddress,
      deliveryDate: formData.deliveryDate,
      notes: formData.notes || '',
      shippingMethod: formData.shippingMethod || 'standard',
      totalAmount: calculateTotal(validItems)
    };

    console.log('Submitting order data:', JSON.stringify(orderData, null, 2));
    
    try {
      setSubmitting(true);
      
      // Create order
      const response = await orderService.createOrder(orderData);
      const newOrder = response.data || response;
      
      // Show success message and redirect to orders page
      showSnackbar('Order created successfully!', 'success');
      setTimeout(() => {
        navigate(`/orders/${newOrder.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating order:', error);
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (error.response) {
        // Handle 400 Bad Request with validation errors
        if (error.response.status === 400) {
          const { data } = error.response;
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.message) {
            errorMessage = data.message;
          } else if (Array.isArray(data?.errors)) {
            errorMessage = data.errors.map(err => err.msg || err.message).join('\n');
          } else {
            errorMessage = JSON.stringify(data);
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Error details:', errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Create New Order
        </Typography>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Customer Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" margin="normal" required>
                <InputLabel id="customer-label">Customer</InputLabel>
                <Select
                  labelId="customer-label"
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  label="Customer"
                >
                  <MenuItem value="">
                    <em>Select a customer</em>
                  </MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Shipping Method */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="shipping-method-label">Shipping Method</InputLabel>
                <Select
                  labelId="shipping-method-label"
                  id="shippingMethod"
                  name="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={handleInputChange}
                  label="Shipping Method"
                >
                  <MenuItem value="standard">Standard Shipping</MenuItem>
                  <MenuItem value="express">Express Shipping</MenuItem>
                  <MenuItem value="overnight">Overnight Shipping</MenuItem>
                  <MenuItem value="pickup">Store Pickup</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Delivery Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Address"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            {/* Delivery Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delivery Date"
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Order Items */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel id={`product-label-${index}`}>Product</InputLabel>
                            <Select
                              labelId={`product-label-${index}`}
                              value={item.productId}
                              onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                              label="Product"
                              required
                            >
                              <MenuItem value="">
                                <em>Select a product</em>
                              </MenuItem>
                              {products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                  {product.name} (${product.price.toFixed(2)})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            variant="outlined"
                            size="small"
                            inputProps={{ min: 1 }}
                            style={{ width: '80px' }}
                            required
                          />
                        </TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            onClick={() => removeItem(index)}
                            color="error"
                            size="small"
                            disabled={formData.items.length <= 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={addItem}
                          variant="outlined"
                          size="small"
                        >
                          Add Item
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Order Total:</strong>
                      </TableCell>
                      <TableCell colSpan={2}>
                        <strong>${calculateTotal().toFixed(2)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Order Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                multiline
                rows={3}
                placeholder="Any special instructions or notes for this order..."
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Creating Order...' : 'Create Order'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewOrderPage;
