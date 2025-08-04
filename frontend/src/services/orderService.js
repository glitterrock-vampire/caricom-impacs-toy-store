import api from './api';

export const orderService = {
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
};
