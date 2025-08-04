import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Store } from '@mui/icons-material';
import { login } from '../services/authService';

const UserIcon = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4v1a1 1 0 001 1h12a1 1 0 001-1v-1c0-2-3-4-7-4z"/>
  </svg>
);

const LockIcon = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path fillRule="evenodd" d="M5 8V6a5 5 0 1110 0v2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2zm2-2a3 3 0 116 0v2H7V6zm-2 4v6h10v-6H5z" clipRule="evenodd"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Set body class for login page styling
  useEffect(() => {
    document.body.className = 'login-page';

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.className = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-panel-wrapper">
        <div className="login-left-panel">
          <Box className="login-brand" display="flex" alignItems="center">
            <Store sx={{ mr: 1, fontSize: 32 }} />
            TOY STORE DASHBOARD
          </Box>
          <div className="login-info">
            Welcome to the CARICOM IMPACS Toy Store Management System.<br />
            Manage customers, orders, and international shipping with ease!<br />
            <br />
            <strong>Assessment Project</strong><br />
            Implementation Agency for Crime and Security
          </div>
        </div>
        <div className="login-divider" />
        <div className="login-right-panel">
          <div className="login-form-box">
            <div className="login-form-title">Sign In</div>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <UserIcon />
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="input-group">
                <LockIcon />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="login-options">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    style={{ marginRight: 4 }}
                  />
                  Remember me
                </label>
                <a href="#" className="login-forgot">Forgot Password?</a>
              </div>
              <button className="btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'LOGIN'}
              </button>
              {error && <div className="text-error">{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}