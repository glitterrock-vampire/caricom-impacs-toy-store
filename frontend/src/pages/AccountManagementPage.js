import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import { Edit, Add, PersonAdd } from '@mui/icons-material';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AccountManagementPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telephone: '',
  });

  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: true,
    isActive: true,
  });

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleEditProfile = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      telephone: user.telephone || '',
    });
    setDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await userService.updateUser(user.id, formData);
      setUser({ ...user, ...updatedUser });
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  const handleCreateAdmin = async () => {
    try {
      if (!adminFormData.password) {
        setSnackbar({ open: true, message: 'Password is required', severity: 'error' });
        return;
      }
      
      await userService.createUser(adminFormData);
      setSnackbar({ open: true, message: 'Admin user created successfully!', severity: 'success' });
      setAdminDialogOpen(false);
      setAdminFormData({
        name: '',
        email: '',
        password: '',
        isAdmin: true,
        isActive: true,
      });
    } catch (err) {
      console.error('Failed to create admin:', err);
      setSnackbar({ open: true, message: 'Failed to create admin user', severity: 'error' });
    }
  };

  const isSuperAdmin = user?.role === 'admin' && user?.isAdmin;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user data found</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Account Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Profile Information
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEditProfile}
                size="small"
              >
                Edit
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Name:</strong> {user.name || 'Not provided'}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography><strong>Phone:</strong> {user.telephone || 'Not provided'}</Typography>
              <Typography><strong>Role:</strong> {user.role}</Typography>
              <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ mr: 1 }}><strong>Status:</strong></Box>
                <Chip 
                  label={user.isActive ? 'Active' : 'Inactive'} 
                  color={user.isActive ? 'success' : 'error'}
                  size="small"
                />
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {isSuperAdmin && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Admin Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => setAdminDialogOpen(true)}
                  size="small"
                >
                  Add Admin
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary">
                As a Super Admin, you can create new admin users who will have administrative privileges.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            variant="outlined"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Admin User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={adminFormData.name}
            onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={adminFormData.email}
            onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={adminFormData.password}
            onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={adminFormData.isActive}
                onChange={(e) => setAdminFormData({ ...adminFormData, isActive: e.target.checked })}
              />
            }
            label="Active User"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateAdmin} variant="contained">
            Create Admin
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountManagementPage;
