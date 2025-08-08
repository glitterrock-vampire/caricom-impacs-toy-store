import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  // Layout
  Container,
  Box,
  Grid,
  Paper,
  Divider,
  
  // Typography
  Typography,
  
  // Inputs
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  
  // Navigation
  Button,
  IconButton,
  
  // Feedback
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  
  // Data Display
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  
  // Overlays
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  
  // Icons
} from '@mui/material';
import { 
  // Actions
  Edit, 
  Add, 
  PersonAdd, 
  Delete, 
  Lock, 
  LockOpen,
  Refresh,
  Save,
  Close,
  Search,
  Visibility,
  
  // User Related
  Person,
  PersonOff,
  PersonOutline,
  AdminPanelSettings,
  
  // Contact
  Email as EmailIcon,
  Phone as PhoneIcon,
  
  // Security
  Password,
  Security,
  
  // Status
  CheckCircle,
  Cancel,
  
  // Navigation
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import { format } from 'date-fns';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AccountManagementPage = () => {
  const navigate = useNavigate();
  
  // Data states
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Error handling
  const [error, setError] = useState(null);
  
  // Dialog visibility states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telephone: '',
    isAdmin: false
  });

  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: true,
    isActive: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Table states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ 
    field: 'name', 
    direction: 'asc' 
  });

  // Fetch current user profile
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const userData = await userService.getCurrentUser();
      setCurrentUser(userData);
      setError(null);
      return userData;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
      setSnackbar({
        open: true,
        message: 'Failed to load user profile',
        severity: 'error'
      });
      throw err;
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
      return usersData;
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load users',
        severity: 'error'
      });
      throw err;
    } finally {
      setUsersLoading(false);
    }
  };

  // Handle page change for users table
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.telephone?.includes(searchTerm)
    );
  });

  // Get current page users
  const currentPageUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Initialize data when component mounts
  useEffect(() => {
    const initializeData = async () => {
      try {
        const user = await fetchCurrentUser();
        if (user?.isAdmin) {
          await fetchAllUsers();
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initializeData();
  }, []);

  // Handle edit profile button click
  const handleEditProfile = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      telephone: currentUser?.telephone || '',
    });
    setProfileDialogOpen(true);
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setActionLoading(true);
      const updatedUser = await userService.updateProfile({
        name: formData.name,
        email: formData.email,
        telephone: formData.telephone,
      });
      
      setCurrentUser(prev => ({ ...prev, ...updatedUser }));
      setSnackbar({ 
        open: true, 
        message: 'Profile updated successfully!', 
        severity: 'success' 
      });
      setProfileDialogOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Failed to update profile', 
        severity: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setSnackbar({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success'
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setPasswordDialogOpen(false);
    } catch (err) {
      console.error('Failed to change password:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to change password',
        severity: 'error'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle create admin user
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
      
      await fetchAllUsers();
    } catch (err) {
      console.error('Failed to create admin:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Failed to create admin user', 
        severity: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      await userService.toggleUserStatus(userId, !currentStatus);
      setSnackbar({
        open: true,
        message: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
        severity: 'success'
      });
      await fetchAllUsers();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update user status',
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
        {/* User Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography component="h2" variant="h6" color="primary">
                My Profile
              </Typography>
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={handleEditProfile}
                disabled={loading}
              >
                Edit
              </Button>
            </Box>
            
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            ) : (
              <Box sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ 
                      width: 72, 
                      height: 72, 
                      mr: 2, 
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {currentUser?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {currentUser?.email || 'N/A'}
                    </Typography>
                    <Chip
                      size="small"
                      label={currentUser?.isAdmin ? 'Administrator' : 'Standard User'}
                      color={currentUser?.isAdmin ? 'primary' : 'default'}
                      sx={{ 
                        mt: 0.5,
                        fontWeight: 500,
                        '& .MuiChip-icon': { ml: 0.5 }
                      }}
                      icon={currentUser?.isAdmin ? <AdminPanelSettings /> : <Person />}
                    />
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Box display="flex" alignItems="center" mb={2.5}>
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.light', 
                        p: 1, 
                        borderRadius: '50%',
                        mr: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36
                      }}
                    >
                      <EmailIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body2">{currentUser?.email || 'N/A'}</Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2.5}>
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.light', 
                        p: 1, 
                        borderRadius: '50%',
                        mr: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36
                      }}
                    >
                      <PhoneIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body2">{currentUser?.telephone || 'Not provided'}</Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2.5}>
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.light', 
                        p: 1, 
                        borderRadius: '50%',
                        mr: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36
                      }}
                    >
                      <Lock sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Password</Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1 }}>••••••••</Typography>
                        <Button
                          size="small"
                          onClick={() => setPasswordDialogOpen(true)}
                          variant="text"
                          sx={{ minWidth: 'auto', p: 0.5 }}
                        >
                          Change
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1.5}>
                    <Typography variant="caption" color="text.secondary">Account Created</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {currentUser?.createdAt ? format(new Date(currentUser.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={1.5}>
                    <Typography variant="caption" color="text.secondary">Last Login</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {currentUser?.lastLogin ? format(new Date(currentUser.lastLogin), 'MMM d, yyyy hh:mm a') : 'Never'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip 
                      size="small" 
                      label={currentUser?.isActive ? 'Active' : 'Inactive'} 
                      color={currentUser?.isActive ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

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
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            variant="outlined"
            value={formData.telephone}
            onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile} 
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Save />}
          >
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