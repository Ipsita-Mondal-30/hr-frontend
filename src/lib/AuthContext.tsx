'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
import { getAuthToken, removeAuthToken } from './cookies';

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'candidate' | 'employee';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: () => { } });

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

  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      console.log('AuthContext token:', token);

      // Special pages that should work without authentication
      const publicPages = ['/', '/select-role', '/role-select', '/auth/callback'];
      const currentPath = window.location.pathname;
      
      if (!token) {
        // If we're on a public page, just set loading to false
        if (publicPages.includes(currentPath)) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Only redirect to home if we're not already there
        if (currentPath !== '/') {
          console.log('No token, redirecting to home');
          window.location.href = '/';
          return;
        }
        
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const userData = res.data;
        setUser(userData);

        // Only redirect to role selection if user has no role and we're not already on role selection pages
        if (!userData.role && !currentPath.includes('role') && currentPath !== '/select-role') {
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

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
