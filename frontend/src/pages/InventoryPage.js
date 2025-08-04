import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { reportService } from '../services/reportService';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add,
  Inventory,
  Edit,
  Delete,
  Visibility,
  TrendingDown,
  Warning,
  CheckCircle,
  Category,
  AttachMoney,
  Inventory2,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '../theme/muiTheme';
import MuiStatCard from '../components/MuiStatCard';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [alertModal, setAlertModal] = useState({
    open: false,
    type: '',
    items: []
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    sku: ''
  });

  // Calculate stats from products
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockItems = products.filter(p => p.stock === 0).length;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getProducts();
      console.log('Fetched products:', data); // Debug log
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async () => {
    try {
      await inventoryService.createProduct(newProduct);
      setSnackbar({ open: true, message: 'Product created successfully!', severity: 'success' });
      setShowCreateForm(false);
      setNewProduct({ name: '', category: '', price: '', stock: '', description: '', sku: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      setSnackbar({ open: true, message: 'Failed to create product', severity: 'error' });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      sku: product.sku
    });
    setShowCreateForm(true);
  };

  const handleUpdateProduct = async () => {
    try {
      await inventoryService.updateProduct(editingProduct.id, {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      });
      setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
      setShowCreateForm(false);
      setEditingProduct(null);
      setNewProduct({ name: '', category: '', price: '', stock: '', description: '', sku: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      setSnackbar({ open: true, message: 'Failed to update product', severity: 'error' });
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await inventoryService.deleteProduct(id);
      setSnackbar({ open: true, message: 'Product deleted successfully!', severity: 'success' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewLowStock = () => {
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
    setAlertModal({
      open: true,
      type: 'low_stock',
      items: lowStockProducts
    });
  };

  const handleViewOutOfStock = () => {
    const outOfStockProducts = products.filter(p => p.stock === 0);
    setAlertModal({
      open: true,
      type: 'out_of_stock',
      items: outOfStockProducts
    });
  };

  const handleExportInventory = async () => {
    try {
      setLoading(true);
      await reportService.exportInventoryReport('csv');
    } catch (error) {
      console.error('Error exporting inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ThemeProvider theme={muiTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 1, sm: 2, md: 3 }
          }}
        >
          <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mb={2}
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 2, sm: 0 }}
            >
              <Inventory sx={{
                fontSize: { xs: 40, sm: 48 },
                color: 'white',
                mr: { xs: 0, sm: 2 }
              }} />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                Inventory Management
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                px: { xs: 2, sm: 0 }
              }}
            >
              Manage your toy store inventory and track stock levels
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MuiStatCard
                title="Total Products"
                icon={Category}
                value={totalProducts.toLocaleString()}
                growth="Active inventory items"
                color="#667eea"
                background="#e0e7ff"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MuiStatCard
                title="Total Value"
                icon={AttachMoney}
                value={`$${totalValue.toLocaleString()}`}
                growth="Inventory worth"
                color="#10b981"
                background="#dcfce7"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MuiStatCard
                title="Low Stock"
                icon={Warning}
                value={lowStockItems.toLocaleString()}
                growth="Items need restocking"
                color="#f59e0b"
                background="#fef3c7"
                onClick={handleViewLowStock}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MuiStatCard
                title="Out of Stock"
                icon={TrendingDown}
                value={outOfStockItems.toLocaleString()}
                growth="Items unavailable"
                color="#ef4444"
                background="#fee2e2"
                onClick={handleViewOutOfStock}
              />
            </Grid>
          </Grid>

          {/* Product Table */}
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <Inventory2 sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h5" component="h2" fontWeight="bold" color="text.primary">
                        Product Inventory
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {products.length} products in your inventory
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={() => {
                      setEditingProduct(null);
                      setNewProduct({ name: '', category: '', price: '', stock: '', description: '', sku: '' });
                      setShowCreateForm(true);
                    }}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    Add Product
                  </Button>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center">Stock</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                          <Box textAlign="center">
                            <Inventory2 sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No products found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={3}>
                              Get started by adding your first product
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => {
                                setEditingProduct(null);
                                setNewProduct({ name: '', category: '', price: '', stock: '', description: '', sku: '' });
                                setShowCreateForm(true);
                              }}
                            >
                              Add Product
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {product.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {product.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={product.category}
                              size="small"
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {product.sku}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                              ${product.price}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color={product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main'}
                            >
                              {product.stock}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold">
                              ${(product.price * product.stock).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={product.status === 'in_stock' ? 'In Stock' : product.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                              color={product.status === 'in_stock' ? 'success' : product.status === 'low_stock' ? 'warning' : 'error'}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" gap={1} justifyContent="flex-end">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.dark' }
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Product">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditProduct(product)}
                                  sx={{
                                    bgcolor: 'info.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'info.dark' }
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Product">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  sx={{
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'error.dark' }
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Add/Edit Product Dialog */}
          <Dialog
            open={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ pb: 2 }}>
              <Box display="flex" alignItems="center">
                <Add sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" component="h2">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingProduct ? 'Update product information' : 'Enter product details to add to inventory'}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="SKU"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Stock Quantity"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                disabled={!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Alert Modal for Low Stock / Out of Stock Details */}
          <Dialog
            open={alertModal.open}
            onClose={() => setAlertModal({ open: false, type: '', items: [] })}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 4 }
            }}
          >
            <DialogTitle sx={{ pb: 2 }}>
              <Box display="flex" alignItems="center">
                {alertModal.type === 'low_stock' ? (
                  <Warning sx={{ color: 'warning.main', mr: 2, fontSize: 32 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', mr: 2, fontSize: 32 }} />
                )}
                <Box>
                  <Typography variant="h5" component="h2">
                    {alertModal.type === 'low_stock' ? 'Low Stock Items' : 'Out of Stock Items'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {alertModal.items.length} items need attention
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              {alertModal.items.length > 0 ? (
                <Box display="grid" gap={2}>
                  {alertModal.items.map((item) => (
                    <Card key={item.id} sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              SKU: {item.sku} | Category: {item.category}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color={item.stock > 0 ? 'warning.main' : 'error.main'}
                            >
                              {item.stock} units
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${item.price} each
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main">
                    All items are well stocked!
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setAlertModal({ open: false, type: '', items: [] })}
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
      </Box>
    </ThemeProvider>
  );
}

export default InventoryPage;
