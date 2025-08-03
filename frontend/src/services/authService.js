import api from './api';

export const TOKEN_KEY = 'auth_token';

export async function login(email, password) {
    try {
      // Using FormData to match OAuth2PasswordRequestForm format
      const formData = new URLSearchParams();
      formData.append('username', email);  // Note: Using 'username' field for email
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.data && response.data.access_token) {
        setToken(response.data.access_token);
        return response.data;
      }
      throw new Error('No access token received');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

export function isAuthenticated() {
  return !!getToken();
}

// Token helper functions
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  // Update axios default headers
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
}

// Initialize axios auth header if token exists
const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Logout function
export function logout() {
  removeToken();
  window.location.href = '/login';
}