'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/cookies';
import api from '@/lib/api';

interface UserMe {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

function isAxiosError(e: unknown): e is { response?: { data?: { error?: string; message?: string } } } {
  return typeof e === 'object' && e !== null && 'response' in e;
}

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<string>('Loading...');
  const [userData, setUserData] = useState<UserMe | null>(null);

  useEffect(() => {
    const testAuth = async () => {
      try {
        const token = getAuthToken();
        console.log('Token from cookies:', token);

        if (!token) {
          setAuthStatus('No token found in cookies');
          return;
        }

        const res = await api.get<UserMe>('/auth/me');
        console.log('Auth response:', res.data);

        setUserData(res.data);
        setAuthStatus('Authentication successful!');
      } catch (err: unknown) {
        console.error('Auth test failed:', err);
        const msg = isAxiosError(err)
          ? err.response?.data?.error || err.response?.data?.message || 'Authentication failed'
          : err instanceof Error
          ? err.message
          : 'Authentication failed';
        setAuthStatus(`Authentication failed: ${msg}`);
      }
    };

    testAuth();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {authStatus}
        </div>
        {userData && (
          <div>
            <strong>User Data:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-2">{JSON.stringify(userData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
