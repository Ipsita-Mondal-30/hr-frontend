'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
import { clearCachedUser, getCachedUser, setCachedUser } from './authCache';
import { clearAllAuthTokens, getAuthToken, setAuthToken } from './cookies';
import { getDashboardPath } from './dashboardRoutes';

const AUTH_ME_TIMEOUT_MS = 20000;

function isAxiosError(err: unknown): err is {
  response?: { status?: number };
  message?: string;
  code?: string;
} {
  return typeof err === 'object' && err !== null && 'response' in err;
}

function isTimeoutError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as { code?: string; message?: string };
  return e.code === 'ECONNABORTED' || (e.message?.includes('timeout') ?? false);
}

async function wakeBackend(): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await api.get('/health', { timeout: 15000 });
      return;
    } catch {
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
}

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'candidate' | 'employee';
  isVerified?: boolean;
  phone?: string;
  position?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  bio?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  education?: string;
  profileCompleteness?: number;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  updateUser: (userData: User) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  logout: () => { },
  updateUser: () => { },
  refreshUser: async () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Always match server HTML on first render — hydrate from cache only in useEffect
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout failed:', error);
    }

    setUser(null);
    setLoading(false);
    clearCachedUser();
    clearAllAuthTokens();

    window.location.href = '/';
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    setCachedUser(userData);
  };

  const fetchUser = async () => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isAuthCallback = currentPath === '/auth/callback';

      // Let /auth/callback handle the OAuth token — avoid stripping ?token= before that page runs
      if (!isAuthCallback) {
        const urlToken = new URLSearchParams(window.location.search).get('token');
        if (urlToken) {
          setAuthToken(urlToken);
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }

    const token = getAuthToken();

    const publicPages = ['/', '/debug', '/select-role', '/role-select', '/auth/callback', '/login'];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    if (!token) {
      setUser(null);
      clearCachedUser();
      setLoading(false);
      return;
    }

    const cachedUser = getCachedUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    try {
      await wakeBackend();
      const res = await api.get('/auth/me', { timeout: AUTH_ME_TIMEOUT_MS });
      const userData = res.data as User;

      setUser(userData);
      setCachedUser(userData);

      // Fetch candidate profile completeness in the background — don't block initial render
      if (userData.role === 'candidate') {
        api
          .get('/candidate/dashboard-stats')
          .then((profileRes) => {
            const completeness = profileRes.data?.profileCompleteness || 0;
            setUser((prev) => (prev ? { ...prev, profileCompleteness: completeness } : prev));
          })
          .catch((profileErr) => {
            console.error('⚠️ Failed to fetch profile completeness:', profileErr);
          });
      }

      // Don't redirect if we're already on a public page (except role-select — handled below)
      const isPublicPage = publicPages.some((page) => currentPath.includes(page));
      const isRoleSelectPage = currentPath.includes('/role-select');

      if (isRoleSelectPage && userData.role) {
        const dashboardPath = getDashboardPath(userData.role);
        if (dashboardPath) {
          window.location.replace(dashboardPath);
          return;
        }
      }

      if (isPublicPage) {
        return;
      }

      // Only redirect to role selection if user has no role and is on a protected page
      if (!userData.role) {
        window.location.replace('/role-select');
      }
    } catch (err: unknown) {
      if (isTimeoutError(err) && cachedUser) {
        // Render cold starts can exceed 20s — keep cached session until backend wakes up
        setUser(cachedUser);
        return;
      }

      console.error(
        '❌ Auth check failed:',
        isAxiosError(err) ? err.response?.status : undefined,
        err instanceof Error ? err.message : err
      );
      if (isAxiosError(err) && err.response?.status === 401) {
        clearAllAuthTokens();
        clearCachedUser();
        setUser(null);
      } else if (!cachedUser) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
