'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DebugPage() {
  const [apiTest, setApiTest] = useState<any>(null);
  const [authTest, setAuthTest] = useState<any>(null);
  const [candidatesTest, setCandidatesTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testAll();
  }, []);

  const testAll = async () => {
    try {
      // Test basic API
      console.log('🧪 Testing basic API...');
      const basicResponse = await api.get('/test');
      setApiTest(basicResponse.data);

      // Check auth tokens
      console.log('🔐 Checking auth tokens...');
      const tokens = {
        localStorage_token: localStorage.getItem('token'),
        localStorage_auth_token: localStorage.getItem('auth_token'),
        cookie_token: document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1],
        cookie_auth_token: document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      };
      setAuthTest(tokens);

      // Test admin candidates endpoint
      console.log('👥 Testing admin candidates endpoint...');
      try {
        const candidatesResponse = await api.get('/admin/candidates');
        setCandidatesTest({ success: true, count: candidatesResponse.data.length, data: candidatesResponse.data });
      } catch (error: any) {
        setCandidatesTest({ success: false, error: error.message, status: error.response?.status });
      }

    } catch (error: any) {
      setApiTest({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const setTestToken = () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODlmMzhlNWNjZmVlNjNmODcyMGYxZWYiLCJlbWFpbCI6ImFkbWluQGNvbXBhbnkuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU1MzEzODk3LCJleHAiOjE3NTU5MTg2OTd9.k9p19gwpWvzf2W04BasuUxQCLvh-42zF3RzpKPjwByA';
    
    localStorage.setItem('token', testToken);
    localStorage.setItem('auth_token', testToken);
    document.cookie = `token=${testToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
    document.cookie = `auth_token=${testToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
    
    alert('Test token set! Refresh the page to test.');
  };

  const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    alert('Tokens cleared! Refresh the page to test.');
  };

  if (loading) {
    return <div className="p-4">Testing API connection...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">🧪 API & Auth Debug</h1>
      
      <div className="flex gap-4">
        <button 
          onClick={setTestToken}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Set Test Token
        </button>
        <button 
          onClick={clearTokens}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Tokens
        </button>
        <button 
          onClick={testAll}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Tests
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">🔗 Basic API Test</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(apiTest, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">🔐 Auth Tokens</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(authTest, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">👥 Admin Candidates Test</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(candidatesTest, null, 2)}</pre>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded">
        <h3 className="font-bold">🔧 Quick Fix Instructions:</h3>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
          <li>Click "Set Test Token" to authenticate as admin</li>
          <li>Go to <a href="/admin/users/candidates" className="text-blue-600 underline">/admin/users/candidates</a></li>
          <li>You should see 3 candidates from the database</li>
          <li>Use the 🗑️ button to delete users and see real-time updates</li>
        </ol>
      </div>
    </div>
  );
}