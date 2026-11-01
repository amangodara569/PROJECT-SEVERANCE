import axios from 'axios';

// Single axios instance for all API calls
const api = axios.create({
  baseURL: '/api'
});

// Request interceptor to automatically attach JWT token if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

