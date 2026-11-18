import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');

// ==================== PROFILE API ====================

export const getProfile = () => api.get('/profile');
export const updateProfile = (profileData) => api.put('/profile', profileData);

// ==================== ANALYZE API ====================

export const analyze = () => api.post('/analyze');
export const getAnalysisHistory = () => api.get('/analyze/history');
export const getLatestAnalysis = () => api.get('/analyze/latest');

// ==================== MARKET API ====================

export const getMarketData = () => api.get('/market/update');
export const getStockQuote = (symbol) => api.get(`/market/quote/${symbol}`);

// Individual stock detail (richer — includes 52-week range, P/E, market cap, sector)
export const getStockDetail = (symbol) => api.get(`/market/stock/${symbol}`);

// Mutual fund scheme APIs
export const getSchemeDetail = (schemeCode) => api.get(`/market/scheme/${schemeCode}`);
export const searchSchemes = (query) => api.get(`/market/schemes/search?q=${encodeURIComponent(query)}`);

// ==================== EMAIL API ====================

export const subscribeEmail = () => api.post('/email/subscribe');
export const unsubscribeEmail = () => api.post('/email/unsubscribe');
export const sendTestEmail = () => api.post('/email/test');
export const getEmailStatus = () => api.get('/email/status');

export default api;
