'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hr-system-x2uf.onrender.com';

interface OAuthTestResults {
  error?: string;
  success?: boolean;
  message?: string;
  config?: {
    clientId?: string;
    redirectUri?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string';
}

export default function OAuthTestPage() {
  const [testResults, setTestResults] = useState<OAuthTestResults | null>(null);
  const [loading, setLoading] = useState(false);

  const testOAuthConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/oauth-test`);
      const data: OAuthTestResults = await response.json();
      setTestResults(data);
    } catch (error: unknown) {
      const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error occurred';
      setTestResults({ error: errorMessage });
    }
    setLoading(false);
  };

  useEffect(() => {
    testOAuthConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">OAuth Configuration Test</h1>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">Current Configuration</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</p>
                <p><strong>Backend API URL:</strong> {API_BASE_URL}</p>
                <p><strong>OAuth Login URL:</strong> {API_BASE_URL}/api/auth/google</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Testing OAuth configuration...</p>
              </div>
            ) : testResults ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            ) : null}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Test OAuth Flow</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => window.open(`${API_BASE_URL}/api/oauth-test`, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Test Backend OAuth Config
                </button>

                <a
                  href={`${API_BASE_URL}/api/auth/google`}
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center"
                >
                  Test Google OAuth Login
                </a>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">Required Google Cloud Console Settings</h3>
              <div className="space-y-2 text-sm text-yellow-800">
                <p><strong>Authorized JavaScript origins:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>https://hr-frontend-54b2.vercel.app</li>
                  <li>http://localhost:3000</li>
                </ul>
                <p className="mt-4"><strong>Authorized redirect URIs:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>https://hr-system-x2uf.onrender.com/api/auth/google/callback</li>
                  <li>http://localhost:8080/api/auth/google/callback</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
