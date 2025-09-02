import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
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
  let token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  
  // If not in localStorage, try to get from cookies
  if (!token) {
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='));
      
    if (authCookie) {
      token = authCookie.split('=')[1];
      // Store in localStorage for future use
      localStorage.setItem('auth_token', token);
    }
  }
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Adding auth token to request:', config.url);
  } else {
    console.log('No auth token found for request:', config.url);
  }
  
  return config;
});

export default api;
