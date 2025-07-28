'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/cookies';
import api from '@/lib/api';

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<string>('Loading...');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const testAuth = async () => {
      try {
        const token = getAuthToken();
        console.log('Token from cookies:', token);

        if (!token) {
          setAuthStatus('No token found in cookies');
          return;
        }

        const res = await api.get('/auth/me');
        console.log('Auth response:', res.data);
        
        setUserData(res.data);
        setAuthStatus('Authentication successful!');
      } catch (err: any) {
        console.error('Auth test failed:', err);
        setAuthStatus(`Authentication failed: ${err.response?.data?.error || err.message}`);
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
            <pre className="bg-gray-100 p-2 rounded mt-2">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 