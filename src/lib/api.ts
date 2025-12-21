import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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
  
  // Add auth token if available - check cookies first (most reliable)
  const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1] ||
    localStorage.getItem('auth_token') || 
    localStorage.getItem('token');
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 API request with token:', token.substring(0, 20) + '...');
  } else {
    console.warn('⚠️ No auth token found for API request');
  }
  
  return config;
}, (error) => {
  console.error('❌ API request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - clearing auth and redirecting');
      // Clear auth state
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      // Redirect to home
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
