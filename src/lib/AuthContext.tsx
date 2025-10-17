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
      // Call backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout failed:', error);
    }
    
    // Clear frontend state and cookies
    setUser(null);
    setLoading(false);
    removeAuthToken();
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // Redirect to login page
    window.location.href = '/login';
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const fetchUser = async () => {
    const token = getAuthToken();
    console.log('AuthContext token:', token ? 'Present' : 'Missing');

    // Always allow access to public pages without redirects
    const publicPages = ['/', '/debug', '/select-role', '/role-select', '/auth/callback', '/login'];
    const currentPath = window.location.pathname;
    
    if (!token) {
      console.log('No token found, user not authenticated');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      const userData = res.data;
      console.log('User data from token:', userData);
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

      // Only redirect to role selection if user has no role and is on a protected page
      if (!userData.role) {
        console.log('User has no role, redirecting to role selection');
        window.location.href = `/role-select?token=${token}`;
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
