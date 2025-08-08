import api from './api';

const handleResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  throw new Error(response.data?.message || 'Something went wrong');
};

export const userService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/auth/users');
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  // Get single user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/auth/users/${userId}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      throw error;
    }
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post('/api/auth/users', userData);
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  // Update user (admin only or self)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/api/auth/users/${userId}`, userData);
      return handleResponse(response);
    } catch (error) {
      console.error(`Failed to update user ${userId}:`, error);
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/auth/users/${userId}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
      throw error;
    }
  },

  // Toggle user active status (admin only)
  toggleUserStatus: async (userId, isActive) => {
    try {
      const response = await api.patch(`/api/auth/users/${userId}/status`, { isActive });
      return handleResponse(response);
    } catch (error) {
      console.error(`Failed to toggle status for user ${userId}:`, error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  },

  // Update current user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/auth/profile', userData);
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', { currentPassword, newPassword });
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },
};
