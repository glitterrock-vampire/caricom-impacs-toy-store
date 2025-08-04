// src/services/dashboardService.js
import api from './api';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentOrders = async () => {
  try {
    const response = await api.get('/api/dashboard/recent-orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

export const getMonthlyRevenue = async () => {
  try {
    const response = await api.get('/api/dashboard/monthly-revenue');
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    throw error;
  }
};

// Backward compatibility aliases
export const getWeeklyOrders = getRecentOrders;
export const getPopularProducts = getMonthlyRevenue;

// For backward compatibility
export async function fetchDashboardData() {
  const [stats, recentOrders, monthlyRevenue] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
    getMonthlyRevenue()
  ]);

  return {
    ...stats,
    recent_orders: recentOrders,
    monthly_revenue: monthlyRevenue,
    customer_locations: stats.top_shipping_countries || []
  };
}