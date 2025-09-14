import axios from 'axios';
import { getAuthToken } from './cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hr-system-x2uf.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // 👈 SEND cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add timestamp for cache busting and auth token
api.interceptors.request.use((config) => {
  // Add timestamp to prevent caching
  const timestamp = new Date().getTime();
  const separator = config.url?.includes('?') ? '&' : '?';
  config.url = `${config.url}${separator}_t=${timestamp}`;
  
  // Add auth token if available using the same cookie utility
  const token = getAuthToken();
  console.log('🔑 API Interceptor - Token from cookies:', token ? 'Found' : 'Not found');
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ API Interceptor - Authorization header set');
  } else {
    console.log('❌ API Interceptor - No token available');
  }
  
  return config;
});

export default api;
