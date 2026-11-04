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

// Response interceptor to broadcast standard auth and rate limit error events
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('linkedout:api-error', { detail: { status: 401 } }));
      }
    } else if (error.response?.status === 429) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('linkedout:api-error', { detail: { status: 429 } }));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

