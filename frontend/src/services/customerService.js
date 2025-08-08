// Fixed Customer service for API calls
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

/**
 * Calculate customer statistics from orders
 */
const calculateCustomerStats = (orders) => {
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return {
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      lastOrderDate: null
    };
  }

  // Calculate total spent - handle different field names
  const totalSpent = orders.reduce((sum, order) => {
    const amount = parseFloat(
      order.totalAmount || 
      order.total_amount || 
      order.amount || 
      order.total || 
      0
    );
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Find the most recent order date - handle different field names
  let lastOrderDate = null;
  if (orders.length > 0) {
    const validOrders = orders.filter(order => {
      const date = order.orderDate || 
                  order.order_date || 
                  order.createdAt || 
                  order.created_at;
      return date && !isNaN(new Date(date).getTime());
    });

    if (validOrders.length > 0) {
      const sortedOrders = [...validOrders].sort((a, b) => {
        const dateA = new Date(a.orderDate || a.order_date || a.createdAt || a.created_at);
        const dateB = new Date(b.orderDate || b.order_date || b.createdAt || b.created_at);
        return dateB.getTime() - dateA.getTime();
      });
      
      lastOrderDate = sortedOrders[0].orderDate || 
                     sortedOrders[0].order_date || 
                     sortedOrders[0].createdAt || 
                     sortedOrders[0].created_at;
    }
  }

  return {
    totalOrders,
    totalSpent,
    avgOrderValue,
    lastOrderDate: lastOrderDate ? new Date(lastOrderDate) : null
  };
};

// Default page size for paginated requests
const DEFAULT_PAGE_SIZE = 10;

export const customerService = {
  /**
   * Get paginated list of customers with enhanced order data
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   */
  async getCustomers(params = {}) {
    try {
      // First, get all customers
      const customersResponse = await api.get('/api/customers', {
        params: {
          page: 1,
          limit: 1000, // Get all customers to avoid pagination issues
          ...params,
        },
      });
      
      console.log('getCustomers response:', customersResponse.data); // Debug log
      
      // Handle the actual backend response format
      let customers = [];
      if (customersResponse.data && customersResponse.data.customers) {
        customers = customersResponse.data.customers;
      } else if (Array.isArray(customersResponse.data)) {
        customers = customersResponse.data;
      } else {
        customers = [];
      }

      // For each customer, fetch their orders and calculate statistics
      const enhancedCustomers = await Promise.all(customers.map(async (customer) => {
        try {
          // Fetch orders for this customer
          const ordersResponse = await api.get(`/api/customers/${customer.id}/orders`);
          const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
          
          // Calculate statistics from the orders
          const stats = calculateCustomerStats(orders);
          
          return {
            ...customer,
            orders: orders, // Include the full orders array
            totalSpent: stats.totalSpent,
            totalOrders: stats.totalOrders,
            avgOrderValue: stats.avgOrderValue,
            lastOrderDate: stats.lastOrderDate,
            lastOrder: stats.lastOrderDate, // Alias for compatibility
            stats: stats, // Keep stats object for reference
            // Ensure status is set
            status: customer.status || (stats.totalOrders > 0 ? 'active' : 'inactive')
          };
        } catch (error) {
          console.error(`Error fetching orders for customer ${customer.id}:`, error);
          // Return customer with empty stats if there's an error fetching orders
          return {
            ...customer,
            orders: [],
            totalSpent: 0,
            totalOrders: 0,
            avgOrderValue: 0,
            lastOrderDate: null,
            lastOrder: null,
            stats: calculateCustomerStats([]),
            status: customer.status || 'inactive'
          };
        }
      }));

      console.log('Enhanced customers with orders:', enhancedCustomers); // Debug log
      return enhancedCustomers;
    } catch (error) {
      const message = formatErrorMessage(error, 'Failed to fetch customers');
      throw new Error(message);
    }
  },

  /**
   * Get customer by ID with orders and calculated stats
   * @param {string|number} id - Customer ID
   */
  async getCustomerById(id) {
    try {
      // First get the customer details
      const customerResponse = await api.get(`/api/customers/${id}`);
      console.log(`getCustomerById(${id}) customer response:`, customerResponse.data);
      
      // Then get the customer's orders with calculated totals
      const ordersResponse = await api.get(`/api/customers/${id}/orders`);
      console.log(`getCustomerById(${id}) orders response:`, ordersResponse.data);
      
      const customer = customerResponse.data;
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
      
      // Calculate statistics from the orders
      const stats = calculateCustomerStats(orders);
      
      return {
        ...customer,
        orders: orders, // Include the full orders array
        totalSpent: stats.totalSpent,
        totalOrders: stats.totalOrders,
        avgOrderValue: stats.avgOrderValue,
        lastOrderDate: stats.lastOrderDate,
        lastOrder: stats.lastOrderDate,
        stats: stats
      };
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
      // Add a default password since backend requires it
      const dataWithPassword = {
        ...customerData,
        password: customerData.password || 'TempPassword123!' // You should handle this properly
      };
      
      const response = await api.post('/api/customers', dataWithPassword);
      const customer = response.data;
      
      // New customers have no orders, so stats are zero
      return {
        ...customer,
        totalSpent: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        lastOrderDate: null,
        lastOrder: null,
        orders: [],
        stats: {
          totalSpent: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          lastOrderDate: null
        }
      };
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
      // Remove password from update data as it's not needed for updates
      const { password, ...updateData } = customerData;
      const response = await api.put(`/api/customers/${id}`, updateData);
      
      // After update, fetch the full customer with orders to recalculate stats
      return await this.getCustomerById(id);
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
          limit: 1000, // Get all orders
          ...params,
        },
      });
      
      console.log(`getCustomerOrders(${customerId}) response:`, response.data); // Debug log
      
      // Return the orders array directly
      return Array.isArray(response.data) ? response.data : [];
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
      // Try the standard orders endpoint first
      const response = await api.get('/api/orders', {
        params: {
          page: 1,
          limit: 1000, // Get all orders
          ...params,
        },
      });
      
      console.log('getAllOrders response:', response.data); // Debug log
      
      // Handle different response formats
      if (response.data && response.data.orders) {
        return response.data.orders;
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn('Failed to fetch from /api/orders, trying customers/orders endpoint...', error.message);
      
      // Fallback to customers orders endpoint if main orders endpoint doesn't exist
      try {
        const response = await api.get('/api/customers/orders');
        console.log('getAllOrders fallback response:', response.data); // Debug log
        return Array.isArray(response.data) ? response.data : [];
      } catch (fallbackError) {
        console.error('Both orders endpoints failed:', fallbackError);
        const message = formatErrorMessage(error, 'Failed to fetch orders');
        throw new Error(message);
      }
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
      
      const customers = response.data || [];
      
      // Enhance search results with calculated statistics
      return customers.map(customer => {
        const stats = calculateCustomerStats(customer.orders || []);
        return {
          ...customer,
          totalSpent: stats.totalSpent,
          totalOrders: stats.totalOrders,
          avgOrderValue: stats.avgOrderValue,
          lastOrderDate: stats.lastOrderDate,
          lastOrder: stats.lastOrderDate,
          stats: stats
        };
      });
    } catch (error) {
      // If search endpoint doesn't exist, fallback to getting all customers and filtering
      console.warn('Search endpoint not available, using client-side filtering');
      try {
        const customers = await this.getCustomers();
        const searchLower = query.toLowerCase();
        return customers.filter(customer => 
          (customer.name?.toLowerCase().includes(searchLower)) ||
          (customer.email?.toLowerCase().includes(searchLower)) ||
          (customer.phone?.toLowerCase().includes(searchLower))
        );
      } catch (fallbackError) {
        const message = formatErrorMessage(error, 'Failed to search customers');
        throw new Error(message);
      }
    }
  },
};

// Legacy exports for backward compatibility
export async function fetchCustomers(params = {}) {
  return await customerService.getCustomers(params);
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
  return await customerService.getCustomerOrders(customerId, params);
}

// Export the calculation function for use in other components
export { calculateCustomerStats };