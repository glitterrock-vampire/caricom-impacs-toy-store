// Customer service for API calls
import api from './api';

/**
 * Format error message from API response
 */
const formatErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

// Default page size for paginated requests
const DEFAULT_PAGE_SIZE = 10;

export const customerService = {
  /**
   * Get paginated list of customers
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   */
  async getCustomers(params = {}) {
    try {
      const response = await api.get('/api/customers', {
        params: {
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          ...params,
        },
      });
      
      // Handle different response formats
      if (response.data && response.data.customers) {
        return {
          data: response.data.customers,
          total: response.data.total || response.data.customers.length,
          page: response.data.page || 1,
          limit: response.data.limit || DEFAULT_PAGE_SIZE,
        };
      }
      
      // If the response is just an array
      return {
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0,
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
      };
    } catch (error) {
      const message = formatErrorMessage(error, 'Failed to fetch customers');
      throw new Error(message);
    }
  },

  /**
   * Get customer by ID
   * @param {string|number} id - Customer ID
   */
  async getCustomerById(id) {
    try {
      const response = await api.get(`/api/customers/${id}`);
      return response.data;
    } catch (error) {
      const message = formatErrorMessage(error, `Failed to fetch customer with ID: ${id}`);
      throw new Error(message);
    }
  },

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   */
  async createCustomer(customerData) {
    try {
      const response = await api.post('/api/customers', customerData);
      return response.data;
    } catch (error) {
      const message = formatErrorMessage(error, 'Failed to create customer');
      throw new Error(message);
    }
  },

  /**
   * Update an existing customer
   * @param {string|number} id - Customer ID
   * @param {Object} customerData - Updated customer data
   */
  async updateCustomer(id, customerData) {
    try {
      const response = await api.put(`/api/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      const message = formatErrorMessage(error, `Failed to update customer with ID: ${id}`);
      throw new Error(message);
    }
  },

  /**
   * Delete a customer
   * @param {string|number} id - Customer ID
   */
  async deleteCustomer(id) {
    try {
      await api.delete(`/api/customers/${id}`);
      return true;
    } catch (error) {
      const message = formatErrorMessage(error, `Failed to delete customer with ID: ${id}`);
      throw new Error(message);
    }
  },

  /**
   * Get orders for a specific customer
   * @param {string|number} customerId - Customer ID
   * @param {Object} params - Query parameters (page, limit, etc.)
   */
  async getCustomerOrders(customerId, params = {}) {
    try {
      const response = await api.get(`/api/customers/${customerId}/orders`, {
        params: {
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          ...params,
        },
      });
      
      // Handle different response formats
      if (response.data && response.data.orders) {
        return {
          data: response.data.orders,
          total: response.data.total || response.data.orders.length,
          page: response.data.page || 1,
          limit: response.data.limit || DEFAULT_PAGE_SIZE,
        };
      }
      
      return {
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0,
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
      };
    } catch (error) {
      const message = formatErrorMessage(error, `Failed to fetch orders for customer: ${customerId}`);
      throw new Error(message);
    }
  },

  /**
   * Get all orders with pagination
   * @param {Object} params - Query parameters (page, limit, status, etc.)
   */
  async getAllOrders(params = {}) {
    try {
      const response = await api.get('/api/orders', {
        params: {
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          ...params,
        },
      });
      
      // Handle different response formats
      if (response.data && response.data.orders) {
        return {
          data: response.data.orders,
          total: response.data.total || response.data.orders.length,
          page: response.data.page || 1,
          limit: response.data.limit || DEFAULT_PAGE_SIZE,
        };
      }
      
      return {
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0,
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
      };
    } catch (error) {
      const message = formatErrorMessage(error, 'Failed to fetch orders');
      throw new Error(message);
    }
  },

  /**
   * Search customers by name, email, or phone
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   */
  async searchCustomers(query, params = {}) {
    try {
      const response = await api.get('/api/customers/search', {
        params: {
          q: query,
          ...params,
        },
      });
      
      return response.data || [];
    } catch (error) {
      const message = formatErrorMessage(error, 'Failed to search customers');
      throw new Error(message);
    }
  },
};

// Legacy exports for backward compatibility
export async function fetchCustomers(params = {}) {
  const result = await customerService.getCustomers(params);
  return result.data;
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

export async function fetchCustomerOrders(customerId, params = {}) {
  const result = await customerService.getCustomerOrders(customerId, params);
  return result.data;
}
