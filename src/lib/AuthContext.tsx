'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
import { getAuthToken, setAuthToken, removeAuthToken, hasAuthToken } from './cookies';

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

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: () => {} });

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
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      console.log('AuthContext token:', token);

      if (!token) {
        // Allow /select-role page to work even if no token in cookies
        if (window.location.pathname === '/select-role') {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('token')) {
            setUser(null);
            setLoading(false);
            return;
          }
          setUser(null);
          setLoading(false);
          return;
        }
        window.location.href = '/';
        return;
      }

      try {
        const res = await api.get('/auth/me');

        const userData = res.data;
        setUser(userData);

        if (!userData.role && window.location.pathname !== '/select-role') {
          window.location.href = `/select-role?token=${token}`;
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
