// Cookie utility functions for authentication
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRY_DAYS = 7;

export const setAuthToken = (token: string) => {
  console.log('🍪 Setting auth token in cookies');
  
  // Set cookie with appropriate settings
  Cookies.set(TOKEN_COOKIE_NAME, token, { 
    expires: TOKEN_EXPIRY_DAYS,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  
  // Also store in localStorage as backup
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
  
  console.log('✅ Token stored in cookies and localStorage');
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get(TOKEN_COOKIE_NAME);
};

export const removeAuthToken = () => {
  console.log('🗑️ Removing auth token');
  Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
  
  // Also remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
  }
  
  console.log('✅ Token removed from cookies and localStorage');
};

export const hasAuthToken = (): boolean => {
  return !!getAuthToken();
}; 