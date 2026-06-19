// Cookie utility functions for authentication
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRY_DAYS = 7;
const AUTH_TOKEN_KEYS = ['auth_token', 'token'] as const;

function clearDocumentCookies() {
  if (typeof document === 'undefined') return;

  const cookieNames = document.cookie
    .split(';')
    .map((part) => part.trim().split('=')[0])
    .filter((name) => AUTH_TOKEN_KEYS.includes(name as (typeof AUTH_TOKEN_KEYS)[number]));

  for (const name of cookieNames) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`;
  }
}

export const setAuthToken = (token: string) => {
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: TOKEN_EXPIRY_DAYS,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.removeItem('token');
  }
};

export const getAuthToken = (): string | undefined => {
  const cookieToken = Cookies.get(TOKEN_COOKIE_NAME);
  if (cookieToken) return cookieToken;

  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || undefined;
  }

  return undefined;
};

/** Remove every client-side auth token (cookies, localStorage, sessionStorage). */
export const clearAllAuthTokens = () => {
  for (const name of AUTH_TOKEN_KEYS) {
    Cookies.remove(name, { path: '/' });
    Cookies.remove(name, { path: '/', secure: true, sameSite: 'none' });
    Cookies.remove(name, { path: '/', secure: false, sameSite: 'lax' });
  }

  clearDocumentCookies();

  if (typeof window !== 'undefined') {
    for (const key of AUTH_TOKEN_KEYS) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem('dashboardCache');
    localStorage.removeItem('userCache');
    sessionStorage.clear();
  }
};

export const removeAuthToken = () => {
  clearAllAuthTokens();
};

export const hasAuthToken = (): boolean => {
  return !!getAuthToken();
};

/** One-time reset — bump version to force everyone to sign in again. */
export const AUTH_RESET_VERSION = '2026-06-19';

export const runAuthResetIfNeeded = () => {
  if (typeof window === 'undefined') return;

  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) return;

  const key = 'auth_reset_version';
  if (localStorage.getItem(key) === AUTH_RESET_VERSION) return;

  clearAllAuthTokens();
  localStorage.setItem(key, AUTH_RESET_VERSION);
}; 