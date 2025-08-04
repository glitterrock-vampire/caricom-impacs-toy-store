import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { customerService } from '../services/customerService';
import { reportService } from '../services/reportService';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getCustomers();
      // Handle both paginated and direct array responses
      const customerData = response.customers || response;
      setCustomers(Array.isArray(customerData) ? customerData : []);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers. Please try again.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(loadCustomers, 30000);
    return () => clearInterval(interval);
  }, [loadCustomers]);

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        password: '' // Don't pre-fill password for security
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', password: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', password: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editingCustomer) {
        // Update existing customer
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };
        await customerService.updateCustomer(editingCustomer.id, updateData);
        setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
      } else {
        // Create new customer
        if (!formData.password) {
          setSnackbar({ open: true, message: 'Password is required for new customers', severity: 'error' });
          return;
        }
        await customerService.createCustomer(formData);
        setSnackbar({ open: true, message: 'Customer created successfully!', severity: 'success' });
      }
      handleCloseDialog();
      loadCustomers(); // Refresh the list
    } catch (err) {
      console.error('Error saving customer:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save customer. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await customerService.deleteCustomer(customerId);
      setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
      loadCustomers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting customer:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete customer. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await reportService.exportCustomersReport('csv');
      setSnackbar({ open: true, message: 'Export completed successfully!', severity: 'success' });
    } catch (err) {
      console.error('Error exporting data:', err);
      setSnackbar({ open: true, message: 'Failed to export data. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Customer Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCustomers}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            onClick={handleExport}
            disabled={loading || customers.length === 0}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Customer
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : customers.length === 0 ? (
            <Box textAlign="center" py={4}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No customers found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Get started by adding your first customer
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Customer
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Orders</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          {customer.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          {customer.email}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          {customer.phone || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={customer.orders?.length || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Active"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Customer">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(customer)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Customer">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(customer.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            {!editingCustomer && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  helperText="Password is required for new customers"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.name || !formData.email || (!editingCustomer && !formData.password)}
          >
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
