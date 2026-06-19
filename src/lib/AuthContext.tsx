'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
import { clearAllAuthTokens, getAuthToken, setAuthToken } from './cookies';
import { getDashboardPath } from './dashboardRoutes';
// import User from '@/'; // Adjust the import path as necessary
function isAxiosError(err: unknown): err is { response?: { status?: number }; message?: string } {
  return typeof err === 'object' && err !== null && 'response' in err;
}

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'candidate' | 'employee';
  phone?: string;
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
    clearAllAuthTokens();

    window.location.href = '/';
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const fetchUser = async () => {
    // Capture OAuth token from URL (cross-domain: backend cookie is on Render, not Vercel)
    if (typeof window !== 'undefined') {
      const urlToken = new URLSearchParams(window.location.search).get('token');
      if (urlToken) {
        console.log('🔑 OAuth token found in URL, saving to cookies');
        setAuthToken(urlToken);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    const token = getAuthToken();
    console.log('🔍 AuthContext fetchUser - token:', token ? 'Present (' + token.substring(0, 20) + '...)' : 'Missing');

    // Always allow access to public pages without redirects
    const publicPages = ['/', '/debug', '/select-role', '/role-select', '/auth/callback', '/login'];
    const currentPath = window.location.pathname;
    
    if (!token) {
      console.log('❌ No token found, user not authenticated');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Fetching user data from /auth/me...');
      const res = await api.get('/auth/me');
      const userData = res.data;
      console.log('✅ User data received:', {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        _id: userData._id
      });
      
      setUser(userData);
      console.log('✅ User state updated in AuthContext');

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
          console.log('✅ Role already set, leaving role-select for', dashboardPath);
          window.location.replace(dashboardPath);
          return;
        }
      }

      if (isPublicPage) {
        console.log('ℹ️ On public page, no redirect needed');
        return;
      }

      // Only redirect to role selection if user has no role and is on a protected page
      if (!userData.role) {
        console.log('⚠️ User has no role, redirecting to role selection');
        window.location.replace('/role-select');
      }
    } catch (err: unknown) {
      console.error('❌ Auth check failed:', isAxiosError(err) ? err.response?.status : undefined, err instanceof Error ? err.message : err);
      if (isAxiosError(err) && err.response?.status === 401) {
        console.log('🔄 Token invalid, clearing auth state');
        clearAllAuthTokens();
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
