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

      // Always allow access to public pages without redirects
      const publicPages = ['/', '/debug', '/select-role', '/role-select', '/auth/callback'];
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
        setUser(userData);

        // Only redirect to role selection if:
        // 1. User has no role
        // 2. We're not already on a role selection page
        // 3. We're not on the home page (let users stay on home if they want)
        if (!userData.role && 
            !currentPath.includes('role') && 
            !publicPages.includes(currentPath)) {
          console.log('User has no role and is on protected page, redirecting to role selection');
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
