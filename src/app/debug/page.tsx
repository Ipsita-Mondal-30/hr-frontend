'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getAuthToken } from '@/lib/cookies';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';

export default function DebugPage() {
  const { user, loading } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    setRawToken(token);
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setTokenInfo(decoded);
      } catch (err) {
        console.error('Token decode error:', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Authentication Debug</h1>
          
          {/* Navigation */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Quick Navigation</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.location.href = '/'}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                🏠 Force Home
              </button>
              <Link href="/" className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                🏠 Home (Link)
              </Link>
              <Link href="/admin/dashboard" className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                👑 Admin
              </Link>
              <Link href="/hr/dashboard" className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                💼 HR
              </Link>
              <Link href="/candidate/dashboard" className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                👤 Candidate
              </Link>
              <a href="http://localhost:8080/api/auth/google" className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                🔐 Login
              </a>
            </div>
          </div>

          {/* Auth Context Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Auth Context</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Loading:</strong> {loading ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                  <strong>User:</strong> {user ? '✅ Authenticated' : '❌ Not authenticated'}
                </div>
                {user && (
                  <>
                    <div>
                      <strong>Name:</strong> {user.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {user.email}
                    </div>
                    <div>
                      <strong>Role:</strong> {user.role}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Token Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Token Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <strong>Token Present:</strong> {rawToken ? '✅ Yes' : '❌ No'}
              </div>
              
              {tokenInfo && (
                <div className="space-y-2">
                  <div><strong>Token ID:</strong> {tokenInfo._id}</div>
                  <div><strong>Token Name:</strong> {tokenInfo.name}</div>
                  <div><strong>Token Email:</strong> {tokenInfo.email}</div>
                  <div><strong>Token Role:</strong> {tokenInfo.role || 'null'}</div>
                  <div><strong>Issued At:</strong> {new Date(tokenInfo.iat * 1000).toLocaleString()}</div>
                  <div><strong>Expires At:</strong> {new Date(tokenInfo.exp * 1000).toLocaleString()}</div>
                </div>
              )}
              
              {rawToken && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Show Raw Token
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                    {rawToken}
                  </div>
                </details>
              )}
            </div>
          </div>

          {/* Backend Test */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Backend Connection</h2>
            <div className="space-y-2">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('http://localhost:8080/api/test');
                    const data = await res.json();
                    alert('Backend test successful: ' + data.message);
                  } catch (err) {
                    alert('Backend test failed: ' + (err as Error).message);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
              >
                Test Backend
              </button>
              
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('http://localhost:8080/api/auth/test-set-role', {
                      method: 'POST'
                    });
                    const data = await res.json();
                    alert('Auth test successful: ' + data.message);
                  } catch (err) {
                    alert('Auth test failed: ' + (err as Error).message);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
              >
                Test Auth
              </button>
              
              <button
                onClick={() => {
                  // Clear all cookies
                  document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                  });
                  localStorage.clear();
                  sessionStorage.clear();
                  alert('All cookies and storage cleared! Refreshing page...');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear All Data
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Troubleshooting</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• If you can't access home page: Click the "🏠 Home" button above</li>
              <li>• If login fails: Make sure backend is running on port 8080</li>
              <li>• If role selection fails: Check the "Test Auth" button</li>
              <li>• If redirects don't work: Clear cookies and try again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}