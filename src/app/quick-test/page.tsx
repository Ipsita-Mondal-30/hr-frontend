'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function QuickTestPage() {
  const { user, loading, refreshUser } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const router = useRouter();

  const quickLogin = async () => {
    try {
      setTestResult('Logging in...');
      const response = await api.post('/auth/login', {
        email: 'ipsitaamondal@gmail.com',
        password: 'any'
      });
      
      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token);
        setTestResult('Login successful! Refreshing user data...');
        await refreshUser();
        setTestResult('User data refreshed! You should now be authenticated.');
      }
    } catch (error: any) {
      setTestResult('Login failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const testHRAccess = () => {
    router.push('/hr/dashboard');
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Quick Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth Status</h2>
          {user ? (
            <div className="bg-green-50 p-4 rounded">
              <p className="text-green-800">✅ Authenticated</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded">
              <p className="text-red-800">❌ Not authenticated</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button
              onClick={quickLogin}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔑 Quick Login as Ipsita
            </button>
            
            <button
              onClick={testHRAccess}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              disabled={!user || user.role !== 'hr'}
            >
              🎯 Test HR Dashboard Access
            </button>
            
            <button
              onClick={refreshUser}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              🔄 Refresh User Data
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <p className="bg-gray-100 p-4 rounded">{testResult}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/auth-debug" className="text-blue-500 hover:underline mr-4">
            🔍 Auth Debug Page
          </a>
          <a href="/oauth-debug" className="text-blue-500 hover:underline mr-4">
            🔗 OAuth Debug Page
          </a>
          <a href="/login" className="text-blue-500 hover:underline">
            🏠 Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}