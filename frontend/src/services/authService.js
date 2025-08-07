import api from './api';

const TOKEN_KEY = 'auth_token'; // Changed from 'token' to match what's being used
const AUTH_EVENT = 'auth-change';

// Helper to validate token format
export const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  // Simple check for JWT format (3 parts separated by dots)
  return token.split('.').length === 3;
};

export const setToken = (token) => {
  if (!isValidToken(token)) {
    console.error('Invalid token format');
    return false;
  }
  
  try {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  } catch (error) {
    console.error('Error setting token:', error);
    return false;
  }
};

export const getToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return isValidToken(token) ? token : null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
    window.dispatchEvent(new Event(AUTH_EVENT));
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

// Initialize auth header on app start
export const initAuthHeader = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Ensure we clean up any invalid tokens
    removeToken();
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    const { token } = response.data;
    
    if (!token) {
      throw new Error('No token received from server');
    }
    
    if (!setToken(token)) {
      throw new Error('Failed to set authentication token');
    }
    
    // Notify all components about auth state change
    window.dispatchEvent(new Event(AUTH_EVENT));
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    // Clear any invalid tokens on login failure
    removeToken();
    throw error;
  }
};

export const logout = () => {
  removeToken();
  
  // Force a page refresh or state update to trigger navbar re-render
  window.dispatchEvent(new Event('auth-change'));
};

// Initialize on module load
initAuthHeader();

export const authService = {
  login,
  logout,
  isAuthenticated,
  getToken,
  setToken,
  removeToken,

  async getCurrentUser() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.get('/api/auth/profile');
      return response.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      
      // If 401 or 404, user is not authenticated
      if (error.response?.status === 401 || error.response?.status === 404) {
        removeToken();
        window.location.href = '/login';
      }
      
      throw error;
    }
  },
};
