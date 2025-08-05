import api from './api';

export const dashboardService = {
  async getDashboardStats() {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },

  async getRecentOrders() {
    const response = await api.get('/api/dashboard/recent-orders');
    return response.data;
  },

  async getMonthlyRevenue() {
    const response = await api.get('/api/dashboard/monthly-revenue');
    return response.data;
  },

  async getCustomerAnalytics() {
    const response = await api.get('/api/reports/customers/analytics');
    return response.data;
  },

  async getDetailedBreakdown(type, subType) {
    const response = await api.get(`/api/dashboard/breakdown/${type}/${subType}`);
    return response.data;
  },
};

// Export individual functions for backward compatibility
export const getDashboardStats = dashboardService.getDashboardStats;
export const getRecentOrders = dashboardService.getRecentOrders;
export const getMonthlyRevenue = dashboardService.getMonthlyRevenue;
export const getCustomerAnalytics = dashboardService.getCustomerAnalytics;
