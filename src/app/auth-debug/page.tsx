'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import { getAuthToken } from '@/lib/cookies';

type ApiError = {
  response?: { data?: unknown };
  message?: string;
};

type MeSuccess = {
  success?: boolean;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  [key: string]: unknown;
};

type ServerTestResponse =
  | { success: true; [key: string]: unknown }
  | { success: false; error?: string; [key: string]: unknown };

type TestResults = {
  tokenInCookies: 'Present' | 'Missing';
  tokenValue: string;
  tokenInLocalStorage: 'Present' | 'Missing';
  apiMeCall:
    | { success: true; data: MeSuccess }
    | { success: false; error: unknown };
  serverConnectivity:
    | { success: true; data: unknown }
    | { success: false; error: unknown };
};

export default function AuthDebugPage() {
  const { user, loading } = useAuth();
  const [testResults, setTestResults] = useState<TestResults | null>(null);

  const runTests = async () => {
    const results: TestResults = {
      tokenInCookies: 'Missing',
      tokenValue: 'None',
      tokenInLocalStorage: 'Missing',
      apiMeCall: { success: false, error: 'Not run' },
      serverConnectivity: { success: false, error: 'Not run' },
    };

    // Test 1: Check token in cookies
    const token = getAuthToken();
    results.tokenInCookies = token ? 'Present' : 'Missing';
    results.tokenValue = token ? token.substring(0, 20) + '...' : 'None';

    // Test 2: Check localStorage
    const localToken = localStorage.getItem('auth_token') || localStorage.getItem('token');
    results.tokenInLocalStorage = localToken ? 'Present' : 'Missing';

    // Test 3: Test API call to /auth/me
    try {
      const response = await api.get('/auth/me');
      results.apiMeCall = {
        success: true,
        data: response.data as MeSuccess,
      };
    } catch (error: unknown) {
      const e = error as ApiError;
      results.apiMeCall = {
        success: false,
        error: (e && (e.response?.data ?? e.message)) ?? 'Unknown error',
      };
    }

    // Test 4: Check server connectivity
    try {
      const response = await fetch('http://localhost:8080/api/test');
      const data: unknown = await response.json();
      results.serverConnectivity = {
        success: true,
        data: data as ServerTestResponse,
      };
    } catch (error: unknown) {
      const e = error as { message?: string };
      results.serverConnectivity = {
        success: false,
        error: e?.message ?? 'Unknown error',
      };
    }

    setTestResults(results);
  };

  const manualLogin = async () => {
    try {
      const response = await api.post('/auth/login', {
        email: 'ipsitaamondal@gmail.com',
        password: 'any',
      });

      const data = response.data as { success?: boolean; token?: string };
      if (data?.success && data.token) {
        localStorage.setItem('auth_token', data.token);
        window.location.reload();
      }
    } catch (error: unknown) {
      // Keep console logging for debugging visibility
      console.error('Manual login failed:', error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload();
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Auth Context Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth Context Status</h2>
            <div className="space-y-2">
              <p>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}
              </p>
              {user && (
                <div className="bg-gray-100 p-3 rounded">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p>
                    <strong>ID:</strong> {user._id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <button
              onClick={runTests}
              className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔄 Run Tests
            </button>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={manualLogin}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                🔑 Manual Login (Ipsita)
              </button>
              <button
                onClick={clearAuth}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                🗑️ Clear All Auth Data
              </button>
              <a
                href="/hr/dashboard"
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block"
              >
                🎯 Try HR Dashboard
              </a>
              <a
                href="/role-select"
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 inline-block"
              >
                👤 Role Select
              </a>
              <a
                href="http://localhost:8080/api/auth/google"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
              >
                🔗 Google OAuth
              </a>
            </div>
          </div>

          {/* Current Cookies & Storage */}
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Current Storage State</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Cookies</h3>
                <pre className="text-xs bg-gray-100 p-3 rounded">
                  {document.cookie || 'No cookies'}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">LocalStorage</h3>
                <pre className="text-xs bg-gray-100 p-3 rounded">
                  {JSON.stringify(
                    {
                      auth_token: localStorage.getItem('auth_token'),
                      token: localStorage.getItem('token'),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
