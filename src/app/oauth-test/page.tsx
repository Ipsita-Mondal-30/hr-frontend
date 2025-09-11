'use client';
import { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '@/lib/cookies';
import Link from 'next/link';

interface DebugUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  googleId?: string;
}

interface UsersApiRes {
  users?: DebugUser[];
  userCount?: number;
  [key: string]: unknown;
}

// Use environment variable (fallback to Render backend directly)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://hr-system-x2uf.onrender.com";

export default function OAuthTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [users, setUsers] = useState<DebugUser[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const checkBackendStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test`);
      const data: { message?: string } = await response.json();
      setBackendStatus('✅ Running');
      addLog('✅ Backend server is running');
      addLog(`Server message: ${data.message ?? '(no message)'}`);
    } catch (err) {
      console.error(err);
      setBackendStatus('❌ Not running');
      addLog('❌ Backend server is not running');
    }
  }, []);

  const checkUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/debug/users`);
      const data: UsersApiRes = await response.json();
      const list = data.users || [];
      setUsers(list);
      addLog(`📊 Found ${data.userCount ?? list.length} users in database`);
      list.forEach((user) => {
        addLog(`   👤 ${user.name ?? '(no name)'} (${user.email ?? '(no email)'}) - ${user.role || 'No role'}`);
      });
    } catch (err) {
      console.error(err);
      addLog('❌ Failed to fetch users from database');
    }
  }, []);

  const checkCurrentAuth = useCallback(() => {
    const token = getAuthToken();
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (token) {
      addLog('🔑 Found auth token in cookies');
      try {
        const parts = token.split('.');
        const payloadPart: string | undefined = parts[1];
        if (payloadPart) {
          const decoded = atob(payloadPart);
          const payload: { name?: string; role?: string } = JSON.parse(decoded);
          addLog(`👤 Token user: ${payload.name ?? '(unknown)'} (${payload.role ?? '(no role)'})`);
        } else {
          addLog('❌ Invalid token format');
        }
      } catch {
        addLog('❌ Failed to decode token');
      }
    } else {
      addLog('❌ No auth token found');
    }

    if (localToken) {
      addLog('💾 Found token in localStorage');
    } else {
      addLog('❌ No token in localStorage');
    }
  }, []);

  useEffect(() => {
    checkBackendStatus();
    checkUsers();
    checkCurrentAuth();
  }, [checkBackendStatus, checkUsers, checkCurrentAuth]);

  const testGoogleOAuth = () => {
    const redirectUrl = `${API_BASE_URL}/api/auth/google`;
    addLog('🚀 Starting Google OAuth test...');
    addLog(`Redirecting to: ${redirectUrl}`);
    window.location.href = redirectUrl;
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const refreshData = () => {
    setLogs([]);
    checkBackendStatus();
    checkUsers();
    checkCurrentAuth();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OAuth Debug &amp; Test</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Backend Status</h3>
            <p className="text-sm">{backendStatus}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Database Users</h3>
            <p className="text-sm">{users.length} users found</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Auth Status</h3>
            <p className="text-sm">{getAuthToken() ? '✅ Authenticated' : '❌ Not authenticated'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button onClick={testGoogleOAuth} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            🔐 Test Google OAuth
          </button>

          <button onClick={refreshData} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            🔄 Refresh Data
          </button>

          <button onClick={clearLogs} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            🧹 Clear Logs
          </button>

          <Link href="/login" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center">
            ← Back to Login
          </Link>
        </div>

        {/* Users List */}
        {users.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Database Users</h2>
            <div className="space-y-2">
              {users.map((user, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm">Role: {user.role || 'Not set'}</p>
                  <p className="text-xs text-gray-500">Google ID: {user.googleId || 'None'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p>
                No logs yet. Click &quot;Refresh Data&quot; or &quot;Test Google OAuth&quot; to see logs.
              </p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure backend is running (should show &quot;✅ Running&quot; above)</li>
            <li>Click &quot;Test Google OAuth&quot; button</li>
            <li>Login with your Google account</li>
            <li>Watch for redirects and check if user is saved to database</li>
            <li>If it fails, check the backend console logs for detailed error messages</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
