'use client';

import { useAuth } from '@/lib/AuthContext';
import { getAuthToken } from '@/lib/cookies';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { user, loading } = useAuth();
  const [token, setToken] = useState<string | undefined>();
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    setToken(getAuthToken());
    setPathname(window.location.pathname);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Path: {pathname}</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Token: {token ? 'exists' : 'null'}</div>
      <div>Role: {user?.role || 'none'}</div>
    </div>
  );
}