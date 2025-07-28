// Cookie utility functions for authentication
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRY_DAYS = 7;

export const setAuthToken = (token: string) => {
  Cookies.set(TOKEN_COOKIE_NAME, token, { 
    expires: TOKEN_EXPIRY_DAYS,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get(TOKEN_COOKIE_NAME);
};

export const removeAuthToken = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};

export const hasAuthToken = (): boolean => {
  return !!getAuthToken();
}; 