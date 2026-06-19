import axios, { type InternalAxiosRequestConfig } from 'axios';
import { clearAllAuthTokens, getAuthToken, setAuthToken } from './cookies';

/** Set on a request to avoid redirecting to home on 401 (e.g. interview prep bootstrap). */
export type ApiRequestConfig = InternalAxiosRequestConfig & {
  skipAuthRedirect?: boolean;
};

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
  
  // Prefer cookie token; fall back to localStorage and re-sync to cookie
  let token = getAuthToken();
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token') || localStorage.getItem('token') || undefined;
    if (token) setAuthToken(token);
  }
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 API request with token:', token.substring(0, 20) + '...');
  } else {
    console.warn('⚠️ No auth token found for API request');
  }

  // FormData must set its own multipart boundary (not application/json)
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
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
      const config = error.config as ApiRequestConfig | undefined;
      const onInterviewPrep =
        typeof window !== 'undefined' &&
        window.location.pathname.includes('/candidate/interview-prep');

      if (config?.skipAuthRedirect || onInterviewPrep) {
        console.warn('⚠️ 401 on request (no redirect):', config?.url);
        return Promise.reject(error);
      }

      console.error('❌ 401 Unauthorized - clearing auth and redirecting');
      clearAllAuthTokens();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
