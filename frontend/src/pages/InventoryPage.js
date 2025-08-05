import React, { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  IconButton,
  TablePagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import { Edit, Delete, Add, Save, Cancel, Close as CloseIcon } from '@mui/icons-material';
import inventoryService from '../services/inventoryService';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: 0,
    category: '',
    gender: 'unisex',  // Default to unisex
    ageRange: '',      // Add age range
    sku: '',
    imageUrl: '',
    status: 'in_stock'
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getProducts(
        page + 1,
        rowsPerPage,
        searchTerm,
        categoryFilter
      );
      
      console.log('Processed Products Response:', response);
      
      // Make sure we have an array of products
      const productsData = Array.isArray(response.data) ? response.data : [];
      setProducts(productsData);
      
      // Make sure we have valid pagination
      const pagination = response.pagination || {};
      setTotalCount(Number(pagination.total) || 0);
      
      // If we have products but no pagination, update the count
      if (productsData.length > 0 && !pagination.total) {
        setTotalCount(productsData.length);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      showSnackbar('Error loading products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const categories = await inventoryService.getCategories();
      if (categories && Array.isArray(categories) && categories.length > 0) {
        setCategories(categories);
      } else {
        // If no categories returned, use default categories
        const defaultCategories = [
          'Action Figures', 
          'Dolls', 
          'Educational', 
          'Electronic', 
          'Board Games', 
          'Outdoor', 
          'Arts & Crafts'
        ];
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.warn('Error fetching categories, using defaults:', error);
      const defaultCategories = [
        'Action Figures', 
        'Dolls', 
        'Educational', 
        'Electronic', 
        'Board Games', 
        'Outdoor', 
        'Arts & Crafts'
      ];
      setCategories(defaultCategories);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: 0,
      category: categories[0] || '',
      gender: 'unisex',
      ageRange: '',
      sku: '',
      imageUrl: '',
      status: 'in_stock'
    });
    setOpenDialog(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category,
      gender: product.gender || 'unisex',
      ageRange: product.ageRange || '',
      sku: product.sku,
      imageUrl: product.imageUrl || '',
      status: product.status || 'in_stock'
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };

      if (selectedProduct) {
        await inventoryService.updateProduct(selectedProduct.id, productData);
        showSnackbar('Product updated successfully');
      } else {
        await inventoryService.createProduct(productData);
        showSnackbar('Product created successfully');
      }
      
      setOpenDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar(error.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await inventoryService.deleteProduct(id);
        showSnackbar('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showSnackbar('Error deleting product', 'error');
      }
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      await inventoryService.updateStock(id, newStock);
      showSnackbar('Stock updated successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      showSnackbar('Error updating stock', 'error');
    }
  };


  const statusColors = {
    in_stock: 'success',
    low_stock: 'warning',
    out_of_stock: 'error',
    discontinued: 'default'
  };

  const getStatusLabel = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Container maxWidth="xl">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search Products"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
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
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Age Range</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box p={3}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box p={3}>
                      <Typography>No products found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {product.imageUrl && (
                          <Box
                            component="img"
                            src={product.imageUrl}
                            alt={product.name}
                            sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                          />
                        )}
                        <Box>
                          <Typography variant="body1">{product.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {product.sku}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.gender || '-'}</TableCell>
                    <TableCell>{product.ageRange || '-'}</TableCell>
                    <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          type="number"
                          value={product.stock}
                          size="small"
                          sx={{ width: 80 }}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value, 10) || 0;
                            handleUpdateStock(product.id, newStock);
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(product.status || 'in_stock')}
                        color={statusColors[product.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditProduct(product)}
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(product.id)}
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          sx={{ mt: 2 }}
        />
      </Paper>

      {/* Product Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <span>{selectedProduct ? 'Edit Product' : 'Add New Product'}</span>
              <IconButton onClick={() => setOpenDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                variant="outlined"
                size="small"
              />
              
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                variant="outlined"
                size="small"
              />
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <FormControl fullWidth margin="dense" size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="dense" size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="in_stock">In Stock</MenuItem>
                    <MenuItem value="low_stock">Low Stock</MenuItem>
                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                    <MenuItem value="discontinued">Discontinued</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  margin="dense"
                  label="Price"
                  type="number"
                  fullWidth
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  InputProps={{ 
                    inputProps: { min: 0, step: '0.01' },
                    startAdornment: <span style={{ marginRight: 8 }}>$</span>
                  }}
                  required
                  variant="outlined"
                  size="small"
                />
                
                <TextField
                  margin="dense"
                  label="Stock"
                  type="number"
                  fullWidth
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  InputProps={{ inputProps: { min: 0 } }}
                  required
                  variant="outlined"
                  size="small"
                />
              </Box>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  margin="dense"
                  label="SKU"
                  fullWidth
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  variant="outlined"
                  size="small"
                />
                
                <TextField
                  margin="dense"
                  label="Image URL"
                  fullWidth
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  variant="outlined"
                  size="small"
                  placeholder="https://example.com/image.jpg"
                />
              </Box>
              
              {formData.imageUrl && (
                <Box mt={1} textAlign="center">
                  <Typography variant="caption" display="block" gutterBottom>
                    Image Preview
                  </Typography>
                  <Box
                    component="img"
                    src={formData.imageUrl}
                    alt="Preview"
                    sx={{ 
                      maxWidth: '100%', 
                      maxHeight: 200, 
                      objectFit: 'contain',
                      border: '1px solid #eee',
                      borderRadius: 1,
                      p: 1
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)} 
              startIcon={<Cancel />}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained"
              startIcon={<Save />}
            >
              {selectedProduct ? 'Update' : 'Create'} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
