import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardProvider } from './contexts/DashboardContext';
import { isAuthenticated } from './services/authService';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardProvider>
              <DashboardPage />
            </DashboardProvider>
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        } />
        <Route path="/customer-management" element={
          <ProtectedRoute>
            <CustomerManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
        <Route path="*" element={
          isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}
export default App;
