// Customer service for API calls
import api from './api';

export const customerService = {
  async getCustomers() {
    try {
      const response = await api.get('/api/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/api/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  // Create new customer
  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/api/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/api/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    try {
      await api.delete(`/api/customers/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Get orders for a customer
  getCustomerOrders: async (customerId) => {
    try {
      const response = await api.get(`/api/customers/${customerId}/orders`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  },

  async getAllOrders() {
    try {
      const response = await api.get('/api/orders');
      return response.data.orders || response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }
};

// Legacy exports for backward compatibility
export async function fetchCustomers() {
  return customerService.getCustomers();
}

export async function createCustomer(customer) {
  return customerService.createCustomer(customer);
}

export async function updateCustomer(id, customer) {
  return customerService.updateCustomer(id, customer);
}

export async function deleteCustomer(customerId) {
  return customerService.deleteCustomer(customerId);
}

export async function fetchCustomerOrders(customerId) {
  return customerService.getCustomerOrders(customerId);
}
