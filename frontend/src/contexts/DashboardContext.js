// src/contexts/DashboardContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getWeeklyOrders, getPopularProducts } from '../services/dashboardService';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [weeklyOrders, setWeeklyOrders] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, productsData] = await Promise.all([
        getDashboardStats(),
        getWeeklyOrders(),
        getPopularProducts()
      ]);
      setStats(statsData);
      setWeeklyOrders(ordersData);
      setPopularProducts(productsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Temporarily disabled to prevent infinite loop
  // useEffect(() => {
  //   fetchDashboardData();
  // }, []);

  const refreshData = useCallback(() => {
    return fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <DashboardContext.Provider
      value={{
        stats,
        weeklyOrders,
        popularProducts,
        loading,
        error,
        refreshData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};