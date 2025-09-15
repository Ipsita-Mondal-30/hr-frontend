'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setAuthToken, getAuthToken } from '@/lib/cookies';

interface Application {
  _id: string;
  name: string;
  email: string;
  status: string;
  job?: {
    title: string;
  };
}

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const testAuth = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // First test /auth/me to check authentication
      console.log('Testing /auth/me endpoint...');
      const authResponse = await api.get('/auth/me');
      console.log('Auth response:', authResponse.data);
      
      // Then test the applications API
      console.log('Testing applications API...');
      const response = await api.get('/applications?status=pending,reviewed,shortlisted');
      setApplications(response.data);
      setSuccess(`Auth: ${authResponse.data.name} (${authResponse.data.role}) | Found ${response.data.length} applications`);
    } catch (err: any) {
      console.error('Auth test failed:', err);
      setError(`API Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getHRToken = async () => {
    try {
      setLoading(true);
      
      // Try to get HR token from the backend
      const response = await fetch('https://hr-system-x2uf.onrender.com/api/auth/get-hr-token', {
        credentials: 'include',
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('HR Token response:', data);
        
        if (data.token) {
          // Set the token in cookies
          document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          setSuccess('HR token set successfully!');
          
          // Test the API with the new token
          setTimeout(() => testAuth(), 1000);
        } else {
          setError('No token received from backend');
        }
      } else {
        setError(`Failed to get HR token: ${response.status}`);
      }
    } catch (err: any) {
      setError(`Token error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialTest = async () => {
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

    initialTest();
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
        
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">API Testing</h2>
          <div className="space-x-2 mb-4">
            <button 
              onClick={testAuth}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test API'}
            </button>
            
            <button 
              onClick={getHRToken}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Getting Token...' : 'Get HR Token'}
            </button>
            
            <button 
              onClick={() => {
                // Clear all cookies and refresh
                document.cookie.split(";").forEach(function(c) { 
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                window.location.reload();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Cookies & Refresh
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          {applications.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Applications ({applications.length})</h3>
              <div className="space-y-2">
                {applications.slice(0, 5).map((app) => (
                  <div key={app._id} className="bg-gray-50 p-2 rounded">
                    <div><strong>Name:</strong> {app.name}</div>
                    <div><strong>Email:</strong> {app.email}</div>
                    <div><strong>Status:</strong> {app.status}</div>
                    {app.job && <div><strong>Job:</strong> {app.job.title}</div>}
                  </div>
                ))}
                {applications.length > 5 && (
                  <div className="text-gray-500">... and {applications.length - 5} more</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
