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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { 
  Edit, 
  Add, 
  PersonAdd, 
  Delete, 
  Lock, 
  LockOpen,
  Refresh 
} from '@mui/icons-material';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AccountManagementPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [actionLoading, setActionLoading] = useState(false);
  
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

  // Fetch current user profile
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setCurrentUser(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users (admin only)
  const fetchAllUsers = async () => {
    if (!currentUser?.isAdmin) return;
    
    try {
      setUsersLoading(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load users',
        severity: 'error'
      });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchAllUsers();
    }
  }, [currentUser]);

  const handleEditProfile = () => {
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      telephone: currentUser.telephone || '',
    });
    setDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setActionLoading(true);
      const updatedUser = await userService.updateUser(currentUser.id, formData);
      setCurrentUser({ ...currentUser, ...updatedUser });
      setSnackbar({ 
        open: true, 
        message: 'Profile updated successfully!', 
        severity: 'success' 
      });
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Failed to update profile', 
        severity: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      if (!adminFormData.password) {
        setSnackbar({ 
          open: true, 
          message: 'Password is required', 
          severity: 'error' 
        });
        return;
      }
      
      setActionLoading(true);
      await userService.createUser(adminFormData);
      setSnackbar({ 
        open: true, 
        message: 'Admin user created successfully!', 
        severity: 'success' 
      });
      setAdminDialogOpen(false);
      setAdminFormData({
        name: '',
        email: '',
        password: '',
        isAdmin: true,
        isActive: true,
      });
      fetchAllUsers();
    } catch (err) {
      console.error('Failed to create admin:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Failed to create admin user', 
        severity: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      await userService.toggleUserStatus(userId, !currentStatus);
      setSnackbar({
        open: true,
        message: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
        severity: 'success'
      });
      fetchAllUsers();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update user status',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setActionLoading(true);
      await userService.deleteUser(userId);
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      fetchAllUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete user',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography color="error">{error}</Typography>
    </Box>
  );

  if (!currentUser) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography>No user data found</Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Account Management
      </Typography>
      
      <Grid container spacing={3}>
        {/* Current User Profile */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Your Profile
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
              <Typography><strong>Name:</strong> {currentUser.name || 'Not provided'}</Typography>
              <Typography><strong>Email:</strong> {currentUser.email}</Typography>
              <Typography><strong>Phone:</strong> {currentUser.telephone || 'Not provided'}</Typography>
              <Typography><strong>Role:</strong> 
                <Chip 
                  label={currentUser.role} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1, textTransform: 'capitalize' }}
                />
              </Typography>
              <Typography component="div" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box component="span" sx={{ mr: 1 }}><strong>Status:</strong></Box>
                <Chip 
                  label={currentUser.isActive ? 'Active' : 'Inactive'} 
                  color={currentUser.isActive ? 'success' : 'error'}
                  size="small"
                />
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Admin Actions */}
        {currentUser?.isAdmin && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Admin Actions
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                As an administrator, you can manage user accounts and permissions.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchAllUsers}
                size="small"
                disabled={usersLoading}
              >
                Refresh Users
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Users List (Admin Only) */}
      {currentUser?.isAdmin && (
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            {usersLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            color={user.isAdmin ? 'primary' : 'default'}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.isActive ? 'Active' : 'Inactive'} 
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              disabled={actionLoading}
                              color={user.isActive ? 'error' : 'success'}
                              size="small"
                            >
                              {user.isActive ? <Lock /> : <LockOpen />}
                            </IconButton>
                            {!user.isAdmin && (
                              <IconButton
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={actionLoading}
                                color="error"
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      )}

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
          <Button onClick={() => setDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile} 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Save Changes'}
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
            label="Full Name"
            fullWidth
            variant="outlined"
            value={adminFormData.name}
            onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
            sx={{ mb: 2 }}
            required
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
            required
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
            required
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
          <Button onClick={() => setAdminDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateAdmin} 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Create Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountManagementPage;