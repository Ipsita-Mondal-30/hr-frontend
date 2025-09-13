import axios from 'axios';

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
  
  // Add auth token if available
  const token = localStorage.getItem('token') || 
    localStorage.getItem('auth_token') || 
    document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1] ||
    document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;
