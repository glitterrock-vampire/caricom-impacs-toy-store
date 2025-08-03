// src/services/dashboardService.js
import api from './api';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getWeeklyOrders = async () => {
  try {
    const response = await api.get('/dashboard/weekly-orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly orders:', error);
    throw error;
  }
};

export const getPopularProducts = async () => {
  try {
    const response = await api.get('/dashboard/popular-products');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw error;
  }
};

// For backward compatibility
export async function fetchDashboardData() {
  const [stats, weeklyOrders, popularProducts] = await Promise.all([
    getDashboardStats(),
    getWeeklyOrders(),
    getPopularProducts()
  ]);
  
  return {
    ...stats,
    weekly_orders: weeklyOrders,
    toy_distribution: popularProducts,
    customer_locations: stats.top_shipping_countries || []
  };
}