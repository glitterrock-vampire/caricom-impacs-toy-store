// src/contexts/DashboardContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getRecentOrders, getMonthlyRevenue } from '../services/dashboardService';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, revenueData] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(),
        getMonthlyRevenue()
      ]);
      setStats(statsData);
      setRecentOrders(ordersData);
      setMonthlyRevenue(revenueData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Set up auto-refresh every 60 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const refreshData = useCallback(() => {
    return fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <DashboardContext.Provider
      value={{
        stats,
        recentOrders,
        monthlyRevenue,
        loading,
        error,
        refreshData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};