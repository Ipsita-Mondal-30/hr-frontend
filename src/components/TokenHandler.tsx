'use client';

import { useEffect } from 'react';
import { setAuthToken } from '@/lib/cookies';
import { useAuth } from '@/lib/AuthContext';

export default function TokenHandler() {
  const { refreshUser } = useAuth();

  useEffect(() => {
    // /auth/callback owns the full OAuth handoff (token + redirect)
    if (window.location.pathname === '/auth/callback') return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      setAuthToken(token);
      window.history.replaceState({}, '', window.location.pathname);
      refreshUser();
    }
  }, [refreshUser]);

  return null;
}
