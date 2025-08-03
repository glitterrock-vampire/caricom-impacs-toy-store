import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, removeToken } from '../services/authService';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  if (!isAuthenticated()) return null;

  const isActive = (path) => location.pathname === path;
  
  return (
    <nav style={{
      display: 'flex',
      gap: '20px',
      padding: '16px 24px',
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
      alignItems: 'center'
    }}>
      <div style={{
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: 'white',
        marginRight: 'auto'
      }}>
        🎯 CARICOM IMPACS Toy Store
      </div>
      <Link
        to="/dashboard"
        style={{
          color: 'white',
          textDecoration: 'none',
          fontWeight: '600',
          padding: '10px 20px',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          background: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
          border: isActive('/dashboard') ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
          boxShadow: isActive('/dashboard') ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isActive('/dashboard')) {
            e.target.style.background = 'rgba(255,255,255,0.1)';
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive('/dashboard')) {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        📊 Dashboard
      </Link>
      <Link
        to="/customer-management"
        style={{
          color: 'white',
          textDecoration: 'none',
          fontWeight: '600',
          padding: '10px 20px',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          background: isActive('/customer-management') ? 'rgba(255,255,255,0.2)' : 'transparent',
          border: isActive('/customer-management') ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
          boxShadow: isActive('/customer-management') ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isActive('/customer-management')) {
            e.target.style.background = 'rgba(255,255,255,0.1)';
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive('/customer-management')) {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        👥 Customer Management
      </Link>
      <button
        onClick={handleLogout}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
          padding: '10px 20px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.3)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        🚪 Logout
      </button>
    </nav>
  );
}