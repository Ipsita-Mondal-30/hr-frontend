'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
import router from 'next/router';

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'candidate' | 'employee';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Allow /select-role page to work even if no token in localStorage
        if (window.location.pathname === '/select-role') {
          setUser(null);
          setLoading(false);
          return;
        }
        // Otherwise, redirect to home or login
        window.location.href = '/';
        return;
      }
  
      try {
        const res = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = res.data;
        setUser(userData);
  
        // Redirect to /select-role only if role is missing and not already on that page
        if (!userData.role && window.location.pathname !== '/select-role') {
          window.location.href = `/select-role?token=${token}`;
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, []);
  
  

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
