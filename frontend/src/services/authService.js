import api from './api';

const TOKEN_KEY = 'token';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Initialize auth header on app start
export const initAuthHeader = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    const { token } = response.data;
    setToken(token);
    
    // Force a page refresh or state update to trigger navbar re-render
    window.dispatchEvent(new Event('auth-change'));
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
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
