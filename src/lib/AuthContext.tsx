'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
import { getAuthToken, removeAuthToken } from './cookies';
// import User from '@/'; // Adjust the import path as necessary
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
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeAuthToken();
      setUser(null);
      // Redirect to home page after logout
      window.location.href = '/';
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const fetchUser = async () => {
    const token = getAuthToken();
    console.log('🔍 AuthContext fetchUser - token:', token ? 'Present' : 'Missing');
    console.log('🔍 AuthContext fetchUser - current URL:', window.location.href);
    console.log('🔍 AuthContext fetchUser - current path:', window.location.pathname);

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
      console.log('🔄 Making API call to /auth/me with token');
      const res = await api.get('/auth/me');
      const userData = res.data;
      console.log('✅ User data from token:', userData);
      console.log('👤 User role:', userData.role);
      // If user is a candidate, fetch additional profile data including completeness
      if (userData.role === 'candidate') {
        try {
          const profileRes = await api.get('/candidate/dashboard-stats');
          const profileData = profileRes.data;
          userData.profileCompleteness = profileData.profileCompleteness || 0;
          console.log('Profile completeness fetched:', userData.profileCompleteness);
        } catch (profileErr) {
          console.error('Failed to fetch profile completeness:', profileErr);
          userData.profileCompleteness = 0;
        }
      }
      
      setUser(userData);

      // Don't redirect if we're already on a public page or role selection
      if (publicPages.some(page => currentPath.includes(page))) {
        console.log('On public page, no redirect needed');
        return;
      }

      // Handle role-based redirects
      if (!userData.role) {
        console.log('User has no role, redirecting to role selection');
        window.location.href = `/role-select?token=${token}`;
      } else {
        // Auto-redirect authenticated users to their dashboard if they're on the home page
        // But don't redirect if they're already on their correct dashboard path
        const isOnCorrectDashboard = (
          (userData.role === 'admin' && currentPath.startsWith('/admin')) ||
          (userData.role === 'hr' && currentPath.startsWith('/hr')) ||
          (userData.role === 'candidate' && currentPath.startsWith('/candidate')) ||
          (userData.role === 'employee' && currentPath.startsWith('/employee'))
        );
        
        if ((currentPath === '/' || currentPath === '/login') && !isOnCorrectDashboard) {
          console.log('User authenticated with role, redirecting to dashboard:', userData.role);
          switch (userData.role) {
            case 'admin':
              window.location.href = '/admin/dashboard';
              break;
            case 'hr':
              window.location.href = '/hr/dashboard';
              break;
            case 'candidate':
              window.location.href = '/candidate/dashboard';
              break;
            case 'employee':
              window.location.href = '/employee/dashboard';
              break;
          }
        } else if (isOnCorrectDashboard) {
          console.log('User already on correct dashboard path, no redirect needed');
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      removeAuthToken();
      setUser(null);
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
