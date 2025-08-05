import api from './api';

export const userService = {
  // Get all users (admin only)
  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    const response = await api.post('/auth/users', userData);
    return response.data;
  },

  // Update user (admin only or self)
  updateUser: async (userId, userData) => {
    const response = await api.put(`/auth/users/${userId}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },
};
