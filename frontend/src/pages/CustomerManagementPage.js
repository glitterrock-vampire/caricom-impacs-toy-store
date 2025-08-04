import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Person,
  Download,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import CustomerDetailCard from '../components/CustomerDetailCard';
import { muiTheme } from '../theme/muiTheme';
import { customerService } from '../services/customerService';

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching customers and orders...');

      // Fetch real data from backend
      const customersResponse = await customerService.getCustomers();
      console.log('Customers response:', customersResponse);

      const ordersResponse = await customerService.getAllOrders();
      console.log('Orders response:', ordersResponse);

      // Handle both paginated and direct array responses
      const customersData = customersResponse?.customers || customersResponse || [];
      const ordersData = ordersResponse?.orders || ordersResponse || [];

      console.log('Processed customers data:', customersData);
      console.log('Processed orders data:', ordersData);

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
      setCustomers([]); // Ensure it's always an array
      setOrders([]);   // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const createdCustomer = await customerService.createCustomer(newCustomer);
      setCustomers([...customers, createdCustomer]);
      setNewCustomer({ name: '', email: '', phone: '', address: '', notes: '' });
      setShowCreateForm(false);
      setSnackbar({ open: true, message: 'Customer created successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create customer', severity: 'error' });
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await customerService.deleteCustomer(customerId);
      setCustomers(customers.filter(c => c.id !== customerId));
      setOrders(orders.filter(o => o.customer_id !== customerId));
      setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete customer', severity: 'error' });
    }
  };

  const getCustomerOrders = (customerId) => {
    return orders.filter(order => order.customer_id === customerId);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setShowCreateForm(true);
  };

  const handleUpdateCustomer = async () => {
    try {
      const updatedCustomer = await customerService.updateCustomer(editingCustomer.id, newCustomer);
      const updatedCustomers = customers.map(customer =>
        customer.id === editingCustomer.id ? updatedCustomer : customer
      );
      setCustomers(updatedCustomers);
      setNewCustomer({ name: '', email: '', phone: '', address: '', notes: '' });
      setEditingCustomer(null);
      setShowCreateForm(false);
      setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update customer', severity: 'error' });
    }
  };

  const handleViewOrders = (customerId) => {
    // In a real implementation, this would navigate to orders page or show orders modal
    setSnackbar({ open: true, message: `Viewing orders for customer ${customerId}`, severity: 'info' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    const customerData = customers.map(customer => {
      const customerOrders = getCustomerOrders(customer.id);
      return {
        ...customer,
        orderCount: customerOrders.length,
        totalItems: customerOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)
      };
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Orders Report - CARICOM IMPACS</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #667eea; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Toy Store Customer Orders Report</h1>
            <p><strong>CARICOM IMPACS Assessment Project</strong></p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Total Items</th>
              </tr>
            </thead>
            <tbody>
              ${customerData.map(customer => `
                <tr>
                  <td>${customer.name}</td>
                  <td>${customer.email}</td>
                  <td>${customer.phone}</td>
                  <td>${customer.orderCount}</td>
                  <td>${customer.totalItems}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Total Customers: ${customers.length}</p>
            <p>Total Orders: ${orders.length}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Box textAlign="center" color="white">
          <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
          <Typography variant="h5" component="h2">
            Loading Customers...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '16px', 
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 15px 0' }}>Error Loading Data</h2>
          <p style={{ color: '#64748b', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
        }}
      >
        <Container maxWidth="xl">
          <Box textAlign="center" mb={5}>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
              <Person sx={{ fontSize: 48, color: 'white', mr: 2 }} />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                Customer Management
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500
              }}
            >
              CARICOM IMPACS Assessment - Manage customers and orders
            </Typography>
          </Box>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {showCreateForm ? 'Cancel' : '+ Add Customer'}
        </button>
        <button
          onClick={exportPDF}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Export PDF Report
        </button>
      </div>

      {/* Create Customer Form */}
      {showCreateForm && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '600px',
          margin: '0 auto 40px auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '24px', color: '#1e293b' }}>Add New Customer</h3>
          <form onSubmit={handleCreateCustomer}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Phone</label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Create Customer
            </button>
          </form>
        </div>
      )}

      {/* Customer List */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '1200px',
        margin: '0 auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h2" sx={{ color: 'text.primary', fontWeight: 700 }}>
              Customers ({customers.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={exportPDF}
              sx={{ borderRadius: 2 }}
            >
              Export PDF
            </Button>
          </Box>

          <Grid container spacing={3}>
            {Array.isArray(customers) && customers.map(customer => (
              <Grid key={customer.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <CustomerDetailCard
                  customer={customer}
                  onEdit={handleEditCustomer}
                  onDelete={handleDeleteCustomer}
                  onViewOrders={handleViewOrders}
                />
              </Grid>
            ))}
          </Grid>

          {/* Floating Action Button */}
          <Fab
            color="primary"
            aria-label="add customer"
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
            }}
            onClick={() => {
              setEditingCustomer(null);
              setNewCustomer({ name: '', email: '', phone: '' });
              setShowCreateForm(true);
            }}
          >
            <Add />
          </Fab>

          {/* Create/Edit Customer Dialog */}
          <Dialog
            open={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Create New Customer'}
            </DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  margin="normal"
                  multiline
                  rows={2}
                />
                <TextField
                  fullWidth
                  label="Notes"
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                  placeholder="Customer preferences, special instructions, etc."
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
                disabled={!newCustomer.name || !newCustomer.email || !newCustomer.phone}
              >
                {editingCustomer ? 'Update' : 'Create'}
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
        </div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
