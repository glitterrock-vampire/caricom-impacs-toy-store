import api from './api';

export const orderService = {
  async createOrder(orderData) {
    try {
      // Debug: Log the token being used for the request
      const token = localStorage.getItem('auth_token');
      console.log('Auth token from localStorage:', token ? 'Token exists' : 'No token found');
      
      // Debug: Log the request headers
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : 'No auth header'
      });
      
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      throw error;
    }
  },
  async getOrders(page = 1, limit = 10) {
    try {
      const response = await api.get(`/api/orders?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getOrdersByStatus(status) {
    try {
      const response = await api.get(`/api/orders?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }
  },

  async updateOrder(id, orderData) {
    try {
      const response = await api.put(`/api/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  async getOrderById(id) {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error.response?.status === 404) {
        throw new Error('Order not found');
      }
      throw error;
    }
  },

  async getOrderItems(orderId) {
    try {
      const response = await api.get(`/api/orders/${orderId}/items`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  },
};
