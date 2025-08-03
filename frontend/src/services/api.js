import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000'
});

// Attach JWT token to every request if present
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token'); // Changed from 'token'
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

export default api;
