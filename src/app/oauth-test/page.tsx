'use client';

import { useState, useEffect } from 'react';
import { getAuthToken } from '@/lib/cookies';

export default function OAuthTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [users, setUsers] = useState<any[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    checkBackendStatus();
    checkUsers();
    checkCurrentAuth();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/test');
      const data = await response.json();
      setBackendStatus('✅ Running');
      addLog('✅ Backend server is running');
      addLog(`Server message: ${data.message}`);
    } catch (error) {
      setBackendStatus('❌ Not running');
      addLog('❌ Backend server is not running');
    }
  };

  const checkUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/debug/users');
      const data = await response.json();
      setUsers(data.users || []);
      addLog(`📊 Found ${data.userCount} users in database`);
      data.users?.forEach((user: any) => {
        addLog(`   👤 ${user.name} (${user.email}) - ${user.role || 'No role'}`);
      });
    } catch (error) {
      addLog('❌ Failed to fetch users from database');
    }
  };

  const checkCurrentAuth = () => {
    const token = getAuthToken();
    const localToken = localStorage.getItem('auth_token');
    
    if (token) {
      addLog('🔑 Found auth token in cookies');
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        addLog(`👤 Token user: ${payload.name} (${payload.role})`);
      } catch (err) {
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
  };

  const testGoogleOAuth = () => {
    addLog('🚀 Starting Google OAuth test...');
    addLog('Redirecting to: http://localhost:8080/api/auth/google');
    window.location.href = 'http://localhost:8080/api/auth/google';
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
        <h1 className="text-3xl font-bold mb-8">OAuth Debug & Test</h1>
        
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
          <button
            onClick={testGoogleOAuth}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            🔐 Test Google OAuth
          </button>
          
          <button
            onClick={refreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔄 Refresh Data
          </button>
          
          <button
            onClick={clearLogs}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            🧹 Clear Logs
          </button>
          
          <a
            href="/login"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
          >
            ← Back to Login
          </a>
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
              <p>No logs yet. Click "Refresh Data" or "Test Google OAuth" to see logs.</p>
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
            <li>Make sure backend is running (should show "✅ Running" above)</li>
            <li>Click "Test Google OAuth" button</li>
            <li>Login with your Google account</li>
            <li>Watch for redirects and check if user is saved to database</li>
            <li>If it fails, check the backend console logs for detailed error messages</li>
          </ol>
        </div>
      </div>
    </div>
  );
}